// Secure API Configuration
        const API_BASE = 'https://mycv.i.ng/mycv-backend/api/secure'; // Update this to your actual API endpoint
        
        // Secure API Client Class
        class SecureAPIClient {
            constructor() {
                this.apiBase = API_BASE;
                this.secretKey = 'MCV_2024_ULTRA_SECRET_KEY_CHANGE_THIS_REGULARLY'; // Must match backend
                this.csrfToken = null;
            }
            
            async makeSecureRequest(endpoint, data) {
                const timestamp = Math.floor(Date.now() / 1000);
                const nonce = this.generateNonce();
                
                // Add honeypot fields to detect bots
                const secureData = {
                    ...data,
                    website: '', // Honeypot field - should always be empty
                    url: '', // Honeypot field - should always be empty
                    homepage: '' // Honeypot field - should always be empty
                };
                
                const payload = JSON.stringify(secureData);
                
                // Generate signature
                const signature = await this.generateSignature(timestamp, nonce, payload);
                
                const headers = {
                    'Content-Type': 'application/json',
                    'X-API-Signature': signature,
                    'X-API-Timestamp': timestamp.toString(),
                    'X-API-Nonce': nonce
                };
                
                if (this.csrfToken) {
                    headers['X-CSRF-Token'] = this.csrfToken;
                }
                
                try {
                    const response = await fetch(`${this.apiBase}/${endpoint}`, {
                        method: 'POST',
                        headers: headers,
                        body: payload,
                        credentials: 'same-origin'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const result = await response.json();
                    
                    // Update CSRF token if provided
                    if (result.csrf_token) {
                        this.csrfToken = result.csrf_token;
                    }
                    
                    return result;
                } catch (error) {
                    console.error('Secure API request failed:', error);
                    throw new Error('Request failed. Please try again.');
                }
            }
            
            generateNonce() {
                const array = new Uint8Array(16);
                crypto.getRandomValues(array);
                return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            }
            
            async generateSignature(timestamp, nonce, payload) {
                const message = timestamp + nonce + payload;
                const encoder = new TextEncoder();
                
                try {
                    const key = await crypto.subtle.importKey(
                        'raw',
                        encoder.encode(this.secretKey),
                        { name: 'HMAC', hash: 'SHA-256' },
                        false,
                        ['sign']
                    );
                    
                    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
                    return Array.from(new Uint8Array(signature))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                } catch (error) {
                    console.error('Signature generation failed:', error);
                    throw new Error('Security initialization failed');
                }
            }
        }
        
        // Initialize secure API client
        const secureAPI = new SecureAPIClient();

        // Global variables
        let selectedPackage = '';
        let currentStep = 1;
        let uploadedFile = null;
        let domainCheckTimeout = null;

        // Package selection
        function selectPackage(packageType) {
            selectedPackage = packageType;
            
            // Update UI
            document.querySelectorAll('.card-hover').forEach(card => {
                card.classList.remove('border-blue-500', 'border-purple-500');
            });
            
            if (packageType === 'with-cv') {
                document.getElementById('with-cv-card').classList.add('border-blue-500');
            } else {
                document.getElementById('without-cv-card').classList.add('border-purple-500');
            }
            
            // Show form
            document.getElementById('package-selection').classList.add('hidden');
            document.getElementById('order-form').classList.remove('hidden');
            
            // Show appropriate content in step 2
            if (packageType === 'with-cv') {
                document.getElementById('with-cv-content').classList.remove('hidden');
                document.getElementById('without-cv-content').classList.add('hidden');
            } else {
                document.getElementById('with-cv-content').classList.add('hidden');
                document.getElementById('without-cv-content').classList.remove('hidden');
            }
        }

        // Domain checking with debounce
        document.getElementById('desiredDomain').addEventListener('input', function() {
            const domain = this.value.trim();
            const domainStatus = document.getElementById('domain-status');
            
            // Clear previous timeout
            if (domainCheckTimeout) {
                clearTimeout(domainCheckTimeout);
            }
            
            if (domain.length < 3) {
                domainStatus.innerHTML = '<span class="text-gray-500">Domain must be at least 3 characters</span>';
                return;
            }
            
            domainStatus.innerHTML = '<span class="text-blue-500">🔍 Checking availability...</span>';
            
            // Debounce the API call
            domainCheckTimeout = setTimeout(() => {
                checkDomainAvailability(domain);
            }, 500);
        });

        // Check domain availability
        async function checkDomainAvailability(domain) {
            const domainStatus = document.getElementById('domain-status');
            
            try {
                const data = await secureAPI.makeSecureRequest('domain_check_x7k9m.php', { 
                    domain: domain
                });
                
                if (data.success) {
                    if (data.available) {
                        domainStatus.innerHTML = `<span class="text-green-600">✅ ${domain}.mycv.i.ng is available!</span>`;
                    } else {
                        domainStatus.innerHTML = `<span class="text-red-600">❌ ${data.message}</span>`;
                    }
                } else {
                    domainStatus.innerHTML = `<span class="text-red-600">❌ ${data.error}</span>`;
                }
            } catch (error) {
                console.error('Domain check error:', error);
                domainStatus.innerHTML = '<span class="text-red-600">❌ Unable to check domain availability</span>';
            }
        }

        // File upload handling
        async function handleFileUpload(input) {
            const file = input.files[0];
            if (!file) return;
            
            // Validate file
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload a PDF, DOC, or DOCX file');
                input.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                input.value = '';
                return;
            }
            
            // Show loading
            document.getElementById('file-upload-area').innerHTML = `
                <div class="text-4xl mb-4">⏳</div>
                <p class="text-lg font-medium text-blue-700 mb-2">Uploading...</p>
                <div class="loading-spinner mx-auto"></div>
            `;
            
            try {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('cv_file', file);
                
                const response = await fetch(`${API_BASE}/upload_cv_n4j7k.php`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    uploadedFile = result;
                    document.getElementById('file-upload-area').classList.add('hidden');
                    document.getElementById('file-upload-success').classList.remove('hidden');
                    document.getElementById('uploaded-filename').textContent = result.original_name;
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                console.error('File upload error:', error);
                alert('File upload failed. Please try again.');
                
                // Reset upload area
                document.getElementById('file-upload-area').innerHTML = `
                    <div class="text-4xl mb-4">📄</div>
                    <p class="text-lg font-medium text-gray-700 mb-2">Click to upload your CV</p>
                    <p class="text-sm text-gray-500">PDF, DOC, or DOCX (Max 5MB)</p>
                `;
                input.value = '';
            }
        }

        // Step navigation
        function nextStep() {
            if (validateCurrentStep()) {
                currentStep++;
                updateStepDisplay();
                
                if (currentStep === 3) {
                    updateOrderSummary();
                }
            }
        }

        function prevStep() {
            currentStep--;
            updateStepDisplay();
        }

        function updateStepDisplay() {
            // Hide all steps
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show current step
            document.getElementById(`step-${currentStep}`).classList.add('active');
            
            // Update step indicators
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                indicator.classList.remove('step-active', 'step-completed');
                
                if (index + 1 < currentStep) {
                    indicator.classList.add('step-completed');
                } else if (index + 1 === currentStep) {
                    indicator.classList.add('step-active');
                } else {
                    indicator.classList.add('bg-gray-200');
                }
            });
        }

        function validateCurrentStep() {
            if (currentStep === 1) {
                const requiredFields = ['fullName', 'email', 'phone', 'desiredDomain'];
                for (let field of requiredFields) {
                    const element = document.getElementById(field);
                    if (!element.value.trim()) {
                        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                        element.focus();
                        return false;
                    }
                }
                
                // Validate email
                const email = document.getElementById('email').value;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('Please enter a valid email address');
                    document.getElementById('email').focus();
                    return false;
                }
                
                // Check if domain is available
                const domainStatus = document.getElementById('domain-status').textContent;
                if (!domainStatus.includes('available')) {
                    alert('Please choose an available domain');
                    document.getElementById('desiredDomain').focus();
                    return false;
                }
            }
            
            if (currentStep === 2) {
                if (selectedPackage === 'with-cv') {
                    if (!uploadedFile) {
                        alert('Please upload your CV file');
                        return false;
                    }
                } else {
                    const requiredFields = ['profession', 'location', 'professionalSummary', 'experience', 'workHistory', 'education', 'technicalSkills', 'softSkills'];
                    for (let field of requiredFields) {
                        const element = document.getElementById(field);
                        if (!element.value.trim()) {
                            alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                            element.focus();
                            return false;
                        }
                    }
                }
            }
            
            return true;
        }

        function updateOrderSummary() {
            const packageName = selectedPackage === 'with-cv' ? 'With CV Upload' : 'Custom Creation';
            const amount = selectedPackage === 'with-cv' ? '₦2,500' : '₦5,000';
            const domain = document.getElementById('desiredDomain').value + '.mycv.i.ng';
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            
            document.getElementById('summary-package').textContent = packageName;
            document.getElementById('summary-domain').textContent = domain;
            document.getElementById('summary-name').textContent = name;
            document.getElementById('summary-email').textContent = email;
            document.getElementById('summary-total').textContent = amount;
        }

        // Payment processing
        async function processPayment() {
            const paymentBtn = document.getElementById('payment-btn');
            const spinner = document.getElementById('payment-spinner');
            
            // Show loading
            paymentBtn.disabled = true;
            spinner.classList.remove('hidden');
            
            try {
                // Create order first
                const orderData = await createOrder();
                
                if (orderData.success) {
                    // Initialize Paystack payment
                    const handler = PaystackPop.setup({
                        key: 'pk_live_your_paystack_public_key', // Replace with your Paystack public key
                        email: document.getElementById('email').value,
                        amount: (selectedPackage === 'with-cv' ? 2500 : 5000) * 100, // Amount in kobo
                        currency: 'NGN',
                        ref: orderData.order_reference,
                        metadata: {
                            order_reference: orderData.order_reference,
                            package_type: selectedPackage,
                            domain: document.getElementById('desiredDomain').value
                        },
                        callback: function(response) {
                            verifyPayment(response.reference);
                        },
                        onClose: function() {
                            paymentBtn.disabled = false;
                            spinner.classList.add('hidden');
                        }
                    });
                    
                    handler.openIframe();
                } else {
                    throw new Error(orderData.error || 'Order creation failed');
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                alert('Payment processing failed. Please try again.');
                paymentBtn.disabled = false;
                spinner.classList.add('hidden');
            }
        }

        async function createOrder() {
            const orderData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                desiredDomain: document.getElementById('desiredDomain').value,
                packageType: selectedPackage,
                amount: selectedPackage === 'with-cv' ? 2500 : 5000,
                instructions: document.getElementById('instructions').value
            };
            
            // Add package-specific data
            if (selectedPackage === 'with-cv') {
                if (uploadedFile) {
                    orderData.cvFilename = uploadedFile.filename;
                    orderData.cvFilePath = uploadedFile.url;
                }
            } else {
                orderData.profession = document.getElementById('profession').value;
                orderData.location = document.getElementById('location').value;
                orderData.professionalSummary = document.getElementById('professionalSummary').value;
                orderData.experience = document.getElementById('experience').value;
                orderData.workHistory = document.getElementById('workHistory').value;
                orderData.education = document.getElementById('education').value;
                orderData.additionalEducation = document.getElementById('additionalEducation').value;
                orderData.technicalSkills = document.getElementById('technicalSkills').value;
                orderData.softSkills = document.getElementById('softSkills').value;
                orderData.languages = document.getElementById('languages').value;
                orderData.interests = document.getElementById('interests').value;
                orderData.achievements = document.getElementById('achievements').value;
                orderData.references = document.getElementById('references').value;
            }
            
            return await secureAPI.makeSecureRequest('order_create_m3n8p.php', orderData);
        }

        async function verifyPayment(reference) {
            try {
                const result = await secureAPI.makeSecureRequest('verify_payment_k8l2n.php', {
                    reference: reference
                });
                
                if (result.success) {
                    // Payment successful
                    document.body.innerHTML = `
                        <div class="min-h-screen flex items-center justify-center bg-green-50">
                            <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
                                <div class="text-6xl mb-6">🎉</div>
                                <h2 class="text-2xl font-bold text-green-800 mb-4">Payment Successful!</h2>
                                <p class="text-gray-600 mb-6">Your order has been received and we'll start working on your CV website immediately.</p>
                                <div class="bg-green-50 rounded-lg p-4 mb-6">
                                    <p class="text-sm text-green-700">
                                        <strong>Order Reference:</strong> ${result.order.reference}<br>
                                        <strong>Domain:</strong> ${result.order.domain}<br>
                                        <strong>Amount:</strong> ₦${result.order.amount.toLocaleString()}
                                    </p>
                                </div>
                                <p class="text-sm text-gray-500">You'll receive an email confirmation shortly with next steps.</p>
                            </div>
                        </div>
                    `;
                } else {
                    throw new Error(result.error || 'Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                alert('Payment verification failed. Please contact support with your payment reference: ' + reference);
            }
        }

        // Handle location dropdown change
        function handleLocationChange() {
            const locationSelect = document.getElementById('location');
            const customLocationInput = document.getElementById('customLocation');
            
            if (locationSelect.value === 'Other Nigerian City' || locationSelect.value === 'Outside Nigeria') {
                customLocationInput.classList.remove('hidden');
                customLocationInput.required = true;
                customLocationInput.placeholder = locationSelect.value === 'Other Nigerian City' 
                    ? 'Please specify your Nigerian city' 
                    : 'Please specify your location';
            } else {
                customLocationInput.classList.add('hidden');
                customLocationInput.required = false;
                customLocationInput.value = '';
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            console.log('MyCV.i.ng - Ultra-Secure Platform Loaded 🇳🇬');
        });