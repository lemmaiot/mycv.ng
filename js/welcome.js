// Get URL parameters for dynamic content
        function getUrlParams() {
            const urlParams = new URLSearchParams(window.location.search);
            return {
                orderId: urlParams.get('order_id') || '#CV-' + Date.now(),
                customerName: urlParams.get('customer_name') || 'Valued Customer',
                email: urlParams.get('email') || 'your email address',
                packageType: urlParams.get('package') || 'Standard Package',
                websiteUrl: urlParams.get('website_url') || 'mycv.i.ng/yourname',
                amount: urlParams.get('amount') || '2,500',
                deliveryHours: parseInt(urlParams.get('delivery_hours')) || 24
            };
        }

        // Initialize page with dynamic content
        function initializePage() {
            const params = getUrlParams();
            
            // Update dynamic content
            const welcomeElement = document.getElementById('welcomeMessage');
            const customerEmailElement = document.getElementById('customerEmail');
            const completionTimeElement = document.getElementById('completionTime');
            
            if (welcomeElement) welcomeElement.textContent = `Welcome to the MyCV.i.ng family, ${params.customerName}!`;
            if (customerEmailElement) customerEmailElement.textContent = params.email;
            
            // Calculate completion time
            const completionTime = new Date();
            completionTime.setHours(completionTime.getHours() + params.deliveryHours);
            if (completionTimeElement) {
                completionTimeElement.textContent = completionTime.toLocaleDateString('en-NG', {
                    weekday: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Start countdown timer
            startCountdown(params.deliveryHours);
            
            // Start progress simulation
            startProgressSimulation();
            
            // Show celebration after a short delay
            setTimeout(() => {
                showCelebration();
            }, 500);
        }

        // Countdown timer
        function startCountdown(deliveryHours) {
            const targetTime = new Date();
            targetTime.setHours(targetTime.getHours() + deliveryHours);
            
            function updateCountdown() {
                const now = new Date();
                const timeLeft = targetTime - now;
                
                if (timeLeft > 0) {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                    
                    const hoursElement = document.getElementById('hoursLeft');
                    const minutesElement = document.getElementById('minutesLeft');
                    const secondsElement = document.getElementById('secondsLeft');
                    
                    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
                    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
                    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
                } else {
                    const hoursElement = document.getElementById('hoursLeft');
                    const minutesElement = document.getElementById('minutesLeft');
                    const secondsElement = document.getElementById('secondsLeft');
                    
                    if (hoursElement) hoursElement.textContent = '00';
                    if (minutesElement) minutesElement.textContent = '00';
                    if (secondsElement) secondsElement.textContent = '00';
                }
            }
            
            updateCountdown();
            setInterval(updateCountdown, 1000);
        }

        // Progress simulation
        function startProgressSimulation() {
            let progress = 15;
            const steps = [
                { progress: 15, step: 'Processing your CV and setting up your website...', activeStep: 2 },
                { progress: 35, step: 'Formatting your content for web display...', activeStep: 2 },
                { progress: 55, step: 'Building your professional website design...', activeStep: 3 },
                { progress: 75, step: 'Adding mobile-friendly features...', activeStep: 3 },
                { progress: 90, step: 'Final testing and optimization...', activeStep: 4 },
                { progress: 100, step: 'Your website is ready! Check your email for the link.', activeStep: 4 }
            ];
            
            let currentStepIndex = 0;
            
            function updateProgress() {
                if (currentStepIndex < steps.length) {
                    const currentStep = steps[currentStepIndex];
                    
                    // Update progress bar
                    document.getElementById('progressBar').style.width = currentStep.progress + '%';
                    document.getElementById('progressPercentage').textContent = currentStep.progress + '%';
                    document.getElementById('currentStep').textContent = currentStep.step;
                    
                    // Update step indicators
                    updateStepIndicators(currentStep.activeStep);
                    
                    currentStepIndex++;
                    
                    // Schedule next update (every 3-5 minutes for demo, in real app this would be based on actual progress)
                    if (currentStepIndex < steps.length) {
                        setTimeout(updateProgress, Math.random() * 120000 + 180000); // 3-5 minutes
                    }
                }
            }
            
            // Start progress updates
            setTimeout(updateProgress, 30000); // First update after 30 seconds
        }

        // Update step indicators
        function updateStepIndicators(activeStep) {
            for (let i = 1; i <= 4; i++) {
                const stepElement = document.getElementById(`step${i}`);
                const circle = stepElement.querySelector('div');
                
                if (i < activeStep) {
                    circle.className = 'w-16 h-16 step-completed rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto';
                    circle.innerHTML = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                } else if (i === activeStep) {
                    circle.className = 'w-16 h-16 step-active rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto pulse-animation';
                    circle.textContent = i;
                } else {
                    circle.className = 'w-16 h-16 step-pending rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto';
                    circle.textContent = i;
                }
            }
        }

        // Celebration confetti
        function showCelebration() {
            const celebration = document.getElementById('celebration');
            if (celebration) {
                celebration.classList.remove('hidden');
                
                // Create confetti
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        createConfetti();
                    }, i * 100);
                }
                
                // Hide celebration after 5 seconds
                setTimeout(() => {
                    celebration.classList.add('hidden');
                }, 5000);
            }
        }

        function createConfetti() {
            const celebration = document.getElementById('celebration');
            if (!celebration) return;
            
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#4a90e2', '#008751', '#fbbf24', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            celebration.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti && confetti.parentNode) {
                    confetti.remove();
                }
            }, 4000);
        }

        // Contact button handlers
        function initializeContactButtons() {
            // WhatsApp button
            document.querySelector('button:contains("Chat Now")') && document.querySelector('button').addEventListener('click', function() {
                if (this.textContent.includes('Chat Now')) {
                    window.open('https://wa.me/2348012345678?text=Hi! I just made a payment for my CV website and have a question.', '_blank');
                }
            });
            
            // Email button
            document.querySelectorAll('button').forEach(button => {
                if (button.textContent.includes('Email Us')) {
                    button.addEventListener('click', function() {
                        window.location.href = 'mailto:info@mycv.i.ng?subject=CV Website Order Support&body=Hi, I just completed payment for my CV website and need assistance.';
                    });
                }
            });
        }

        // Sharing functions
        function shareOnWhatsApp() {
            const message = `🎉 Just got my CV turned into a professional website in 24 hours! 

MyCV.i.ng is amazing - they transform your CV into a mobile-friendly website that you can share anywhere. Perfect for job applications, LinkedIn, and networking!

✅ Only ₦2,500 for Standard Package
✅ Ready in 24 hours  
✅ Works perfectly on phones
✅ Professional design

Check it out: https://mycv.i.ng

#CVWebsite #JobSearch #Nigeria #Professional`;
            
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }

        function shareOnLinkedIn() {
            const message = `Excited to share MyCV.i.ng - a game-changing service that transforms your CV into a professional website in just 24 hours! 

Perfect for job seekers, freelancers, and professionals who want to stand out. The mobile-friendly design makes it easy to share your credentials anywhere.

Starting at just ₦2,500. Made for Nigerians, by Nigerians. 

Check it out: https://mycv.i.ng

#CVWebsite #CareerDevelopment #JobSearch #Nigeria #Professional #LinkedInTips`;
            
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://mycv.i.ng')}&summary=${encodeURIComponent(message)}`;
            window.open(linkedinUrl, '_blank');
        }

        function shareOnTwitter() {
            const message = `🚀 Just discovered MyCV.i.ng - they turn your CV into a professional website in 24hrs! 

✅ ₦2,500 only
✅ Mobile-friendly  
✅ Perfect for job hunting

Made for Nigerians 🇳🇬

https://mycv.i.ng

#CVWebsite #JobSearch #Nigeria`;
            
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            window.open(twitterUrl, '_blank');
        }

        function shareOnFacebook() {
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://mycv.i.ng')}&quote=${encodeURIComponent('Amazing service! MyCV.i.ng transforms your CV into a professional website in just 24 hours. Perfect for job seekers and professionals. Starting at ₦2,500. Made for Nigerians! 🇳🇬')}`;
            window.open(facebookUrl, '_blank');
        }

        function copyShareLink() {
            const shareText = `🎉 Check out MyCV.i.ng - they turn your CV into a professional website in 24 hours!

Perfect for job applications and networking. Starting at just ₦2,500.

Visit: https://mycv.i.ng`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    showCopySuccess();
                }).catch(() => {
                    fallbackCopyText(shareText);
                });
            } else {
                fallbackCopyText(shareText);
            }
        }

        function showCopySuccess() {
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Copied!</span>';
            button.classList.add('bg-green-600');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-600');
            }, 2000);
        }

        function fallbackCopyText(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showCopySuccess();
            } catch (err) {
                alert('Please copy this text manually:\n\n' + text);
            }
            document.body.removeChild(textArea);
        }

        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
            initializeContactButtons();
            
            // Add some interactive elements
            document.querySelectorAll('.floating').forEach(element => {
                element.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-15px) scale(1.05)';
                });
                
                element.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0px) scale(1)';
                });
            });
        });

        // Add some fun interactions
        document.addEventListener('click', function(e) {
            // Create ripple effect on clicks
            const ripple = document.createElement('div');
            ripple.style.position = 'fixed';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(74, 144, 226, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = (e.clientX - 25) + 'px';
            ripple.style.top = (e.clientY - 25) + 'px';
            ripple.style.width = '50px';
            ripple.style.height = '50px';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '9999';
            
            document.body.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);




        (function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'970c4d7bc506eef7',t:'MTc1NTQ2NjU0MS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();