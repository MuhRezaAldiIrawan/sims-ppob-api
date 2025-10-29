/**
 * Simple API Testing Script
 * Run: node test/api.test.js
 */

const BASE_URL = "http://localhost:3000";
let TOKEN = "";
let testEmail = `test${Date.now()}@nutech-integrasi.com`;

// Helper function for API calls
async function apiCall(endpoint, method = "GET", body = null, useToken = false) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (useToken && TOKEN) {
        headers["Authorization"] = `Bearer ${TOKEN}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, error: error.message };
    }
}

// Test functions
async function testRegistration() {
    console.log("\n📝 Testing Registration...");
    const result = await apiCall("/registration", "POST", {
        email: testEmail,
        first_name: "Test",
        last_name: "User",
        password: "abcdef1234",
    });

    if (result.status === 200 && result.data.status === 0) {
        console.log("✅ Registration: PASSED");
        return true;
    } else {
        console.log("❌ Registration: FAILED", result.data);
        return false;
    }
}

async function testLogin() {
    console.log("\n🔐 Testing Login...");
    const result = await apiCall("/login", "POST", {
        email: testEmail,
        password: "abcdef1234",
    });

    if (result.status === 200 && result.data.data?.token) {
        TOKEN = result.data.data.token;
        console.log("✅ Login: PASSED");
        console.log("   Token saved:", TOKEN.substring(0, 20) + "...");
        return true;
    } else {
        console.log("❌ Login: FAILED", result.data);
        return false;
    }
}

async function testGetProfile() {
    console.log("\n👤 Testing Get Profile...");
    const result = await apiCall("/profile", "GET", null, true);

    if (result.status === 200 && result.data.data?.email) {
        console.log("✅ Get Profile: PASSED");
        console.log("   Email:", result.data.data.email);
        return true;
    } else {
        console.log("❌ Get Profile: FAILED", result.data);
        return false;
    }
}

async function testUpdateProfile() {
    console.log("\n✏️ Testing Update Profile...");
    const result = await apiCall(
        "/profile/update",
        "PUT",
        {
            first_name: "Updated",
            last_name: "User",
        },
        true
    );

    if (result.status === 200 && result.data.status === 0) {
        console.log("✅ Update Profile: PASSED");
        return true;
    } else {
        console.log("❌ Update Profile: FAILED", result.data);
        return false;
    }
}

async function testGetBanner() {
    console.log("\n🎨 Testing Get Banner...");
    const result = await apiCall("/banner", "GET", null, true);

    if (result.status === 200 && Array.isArray(result.data.data)) {
        console.log("✅ Get Banner: PASSED");
        console.log("   Total banners:", result.data.data.length);
        return true;
    } else {
        console.log("❌ Get Banner: FAILED", result.data);
        return false;
    }
}

async function testGetServices() {
    console.log("\n🛠️ Testing Get Services...");
    const result = await apiCall("/services", "GET", null, true);

    if (result.status === 200 && Array.isArray(result.data.data)) {
        console.log("✅ Get Services: PASSED");
        console.log("   Total services:", result.data.data.length);
        return true;
    } else {
        console.log("❌ Get Services: FAILED", result.data);
        return false;
    }
}

async function testGetBalance() {
    console.log("\n💰 Testing Get Balance...");
    const result = await apiCall("/balance", "GET", null, true);

    if (result.status === 200 && result.data.data?.balance !== undefined) {
        console.log("✅ Get Balance: PASSED");
        console.log("   Current balance:", result.data.data.balance);
        return true;
    } else {
        console.log("❌ Get Balance: FAILED", result.data);
        return false;
    }
}

async function testTopUp() {
    console.log("\n💵 Testing Top Up...");
    const result = await apiCall(
        "/topup",
        "POST",
        {
            top_up_amount: 100000,
        },
        true
    );

    if (result.status === 200 && result.data.data?.balance) {
        console.log("✅ Top Up: PASSED");
        console.log("   New balance:", result.data.data.balance);
        return true;
    } else {
        console.log("❌ Top Up: FAILED", result.data);
        return false;
    }
}

async function testTransaction() {
    console.log("\n💳 Testing Transaction...");
    const result = await apiCall(
        "/transaction",
        "POST",
        {
            service_code: "PULSA",
        },
        true
    );

    if (result.status === 200 && result.data.data?.invoice_number) {
        console.log("✅ Transaction: PASSED");
        console.log("   Invoice:", result.data.data.invoice_number);
        console.log("   Amount:", result.data.data.total_amount);
        return true;
    } else {
        console.log("❌ Transaction: FAILED", result.data);
        return false;
    }
}

async function testTransactionHistory() {
    console.log("\n📜 Testing Transaction History...");
    const result = await apiCall("/transaction/history?offset=0&limit=5", "GET", null, true);

    if (result.status === 200 && result.data.data?.records) {
        console.log("✅ Transaction History: PASSED");
        console.log("   Total records:", result.data.data.records.length);
        return true;
    } else {
        console.log("❌ Transaction History: FAILED", result.data);
        return false;
    }
}

async function testErrorCases() {
    console.log("\n⚠️ Testing Error Cases...");

    // Test invalid login
    const loginError = await apiCall("/login", "POST", {
        email: testEmail,
        password: "wrongpassword",
    });

    const test1 = loginError.status === 401 && loginError.data.status === 103;
    console.log(test1 ? "✅ Invalid login error: PASSED" : "❌ Invalid login error: FAILED");

    // Test no token
    const noToken = await apiCall("/profile", "GET", null, false);
    const test2 = noToken.status === 401 && noToken.data.status === 108;
    console.log(test2 ? "✅ No token error: PASSED" : "❌ No token error: FAILED");

    // Test invalid top up amount
    const invalidAmount = await apiCall(
        "/topup",
        "POST",
        {
            top_up_amount: -1000,
        },
        true
    );
    const test3 = invalidAmount.status === 400 && invalidAmount.data.status === 102;
    console.log(test3 ? "✅ Invalid amount error: PASSED" : "❌ Invalid amount error: FAILED");

    return test1 && test2 && test3;
}

// Main test runner
async function runTests() {
    console.log("=".repeat(60));
    console.log("🧪 SIMS PPOB API - Automated Testing");
    console.log("=".repeat(60));
    console.log(`📍 Testing against: ${BASE_URL}`);
    console.log(`📧 Test email: ${testEmail}`);

    const tests = [
        { name: "Registration", fn: testRegistration },
        { name: "Login", fn: testLogin },
        { name: "Get Profile", fn: testGetProfile },
        { name: "Update Profile", fn: testUpdateProfile },
        { name: "Get Banner", fn: testGetBanner },
        { name: "Get Services", fn: testGetServices },
        { name: "Get Balance", fn: testGetBalance },
        { name: "Top Up", fn: testTopUp },
        { name: "Transaction", fn: testTransaction },
        { name: "Transaction History", fn: testTransactionHistory },
        { name: "Error Cases", fn: testErrorCases },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR -`, error.message);
            failed++;
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Summary");
    console.log("=".repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`);
    console.log("=".repeat(60));
}

// Run tests
runTests().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
