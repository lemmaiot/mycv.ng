// ================================
// Secure API Client
// ================================
class SecureAPIClient {
  constructor() {
    this.apiBase = "https://mycv.i.ng/mycv-backend/api/secure"; // Backend base URL
    this.secretKey = "MCV_2024_ULTRA_SECRET_KEY_CHANGE_THIS_REGULARLY"; // Must match backend key
    this.csrfToken = null; // Will be updated after first request
  }

  /**
   * Make a secure API request with HMAC authentication + CSRF token
   * @param {string} endpoint - API endpoint (e.g., "domain_check.php")
   * @param {object} data - Payload to send
   */
  async makeSecureRequest(endpoint, data) {
    const timestamp = Math.floor(Date.now() / 1000); // Current UNIX time
    const nonce = this.generateNonce(); // Random unique string
    const payload = JSON.stringify(data);

    // Generate HMAC signature
    const signature = await this.generateSignature(timestamp, nonce, payload);

    // Build headers
    const headers = {
      "Content-Type": "application/json",
      "X-API-Signature": signature,
      "X-API-Timestamp": timestamp,
      "X-API-Nonce": nonce,
    };

    // Attach CSRF token if available
    if (this.csrfToken) {
      headers["X-CSRF-Token"] = this.csrfToken;
    }

    // Send secure POST request
    const response = await fetch(`${this.apiBase}/${endpoint}`, {
      method: "POST",
      headers: headers,
      body: payload,
    });

    const result = await response.json();

    // Store CSRF token for future requests
    if (result.csrf_token) {
      this.csrfToken = result.csrf_token;
    }

    return result;
  }

  /**
   * Generate a random nonce (hex string)
   */
  generateNonce() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Generate HMAC SHA256 signature
   */
  async generateSignature(timestamp, nonce, payload) {
    const message = timestamp + nonce + payload;
    const encoder = new TextEncoder();

    // Import secret key
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Create HMAC signature
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );

    // Convert signature to hex string
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

// ================================
// Example Usage: Check Domain Availability
// ================================
const secureAPI = new SecureAPIClient();

/**
 * Check if a domain is available
 * @param {string} domain - Domain name to check
 */
async function checkDomainAvailability(domain) {
  try {
    const data = await secureAPI.makeSecureRequest("domain_check_x7k9m.php", {
      domain: domain,
      website: "", // Honeypot field (must remain empty)
      url: "", // Honeypot field (must remain empty)
    });

    if (data.error) {
      domainStatus.innerHTML = `<span class="text-red-600">❌ ${data.error}</span>`;
    } else if (data.available) {
      domainStatus.innerHTML = `<span class="text-green-600">✅ ${domain}.mycv.i.ng is available!</span>`;
    } else {
      domainStatus.innerHTML = `<span class="text-red-600">❌ ${data.message}</span>`;
    }
  } catch (error) {
    console.error("Domain check error:", error);
    domainStatus.innerHTML =
      '<span class="text-red-600">❌ Unable to check domain availability</span>';
  }
}
