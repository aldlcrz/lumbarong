async function testProducts() {
    try {
        console.log('Testing GET /api/v1/products...');
        const res = await fetch('http://127.0.0.1:5000/api/v1/products');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Products found:', data.length);
        if (data.length > 0) {
            console.log('First product images:', JSON.stringify(data[0].images, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testProducts();
