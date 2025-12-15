const response = await fetch('http://172.20.128.1:3000/api/v1/public/centers');
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
