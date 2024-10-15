const fs = require('fs');
const path = require('path');

// Files to ignore
const filesToIgnore = [
    'ENSRegistryImplementation.json',
    'ERC1967Proxy.json',
    'ETHRegistrarControllerImplementation.json',
    'PublicResolverImplementation.json'
];

// Helper function to ensure folder exists
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
};

const getAddresses = async () => {
    const args = process.argv;
    const networkIndex = args.indexOf('--network');
    const network = (networkIndex !== -1 && args[networkIndex + 1]) ? args[networkIndex + 1] : null;

    if (!network) {
        console.log("Please provide a network name using --network <network_name>");
        return;
    }

    const deploymentPath = path.join(__dirname, 'deployments', network);
    const addressesOutputPath = path.join(__dirname, 'addresses', `${network}_addresses.json`);

    // Check if the deployment folder exists
    if (!fs.existsSync(deploymentPath)) {
        console.error(`Alert: Deployment folder for network "${network}" does not exist.`);
        return; 
    }

    // Check if addresses file for this network already exists
    if (fs.existsSync(addressesOutputPath)) {
        console.error(`Alert: Addresses file for the network "${network}" already exists.`);
        return; 
    }

    // Ensure the output directory exists
    ensureDirectoryExistence(addressesOutputPath);

    let addresses = {};

    // Read all JSON files in the network folder
    const files = fs.readdirSync(deploymentPath);

    for (const file of files) {
        const filePath = path.join(deploymentPath, file);
        
        // Skip the files listed in filesToIgnore
        if (filesToIgnore.includes(file)) {
            console.log(`Skipping file ${file}`);
            continue;
        }

        // Process only .json files
        if (path.extname(filePath) === '.json') {
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // Check if address exists in the JSON file
            if (fileContent.address) {
                const fileNameWithoutExtension = path.basename(file, '.json'); // Remove .json from property name
                addresses[fileNameWithoutExtension] = fileContent.address;
            } else {
                console.log(`No address found in ${file}`);
            }
        }
    }

    // If we have found any addresses, save them to the file
    if (Object.keys(addresses).length > 0) {
        fs.writeFileSync(addressesOutputPath, JSON.stringify(addresses, null, 2));
        console.log(`Addresses saved in ${addressesOutputPath}`);
    } else {
        console.log(`No addresses to save for network "${network}".`);
    }
};

// Run the function
getAddresses();
