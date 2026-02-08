// test-auth.js
const BASE_URL = 'http://localhost:5001/api'; // Make sure this matches your PORT

async function testAuth() {
    console.log("--- 1. TESTING REGISTRATION ---");
    
    // Random user to avoid "User already exists" errors if you run this twice
    const randomNum = Math.floor(Math.random() * 1000); 
    const testUser = {
        username: `user${randomNum}`,
        email: `user${randomNum}@test.com`,
        password: "superSecretPassword123"
    };

    try {
        // A. Try to Register
        const registerResponse = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const registerData = await registerResponse.json();
        console.log("Status:", registerResponse.status);
        console.log("Response:", registerData);

        if (registerResponse.status === 201) {
            console.log("✅ Registration SUCCESS!");
            
            // B. If Register worked, try to Login immediately
            console.log("\n--- 2. TESTING LOGIN ---");
            const loginResponse = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: testUser.email, 
                    password: testUser.password 
                })
            });

            const loginData = await loginResponse.json();
            console.log("Status:", loginResponse.status);
            console.log("Response:", loginData);
            
            if (loginData.token) {
                console.log("✅ Login SUCCESS! Token received.");
                console.log("🔑 Your Token:", loginData.token.substring(0, 20) + "...");
            } else {
                console.log("❌ Login FAILED.");
            }
        } else {
            console.log("❌ Registration FAILED.");
        }

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
        console.log("Make sure your server is running on port 5001!");
    }
}

testAuth();