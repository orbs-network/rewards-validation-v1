
var minimist = require('minimist');
var fs = require('fs');
var csv = require('csv-parse/lib/sync');
var orbsPos = require('orbs-pos-data');
var orbsClient = require('orbs-client-sdk');
var Web3 = require('web3');

var argv = minimist(process.argv.slice(2), {
	string: [ 'source', 'output' ],
	boolean: [ 'forDist' ],
	stopEarly: true
});

const DISTRIBUTION_1_NAME = "Elections01-27";
const DISTRIBUTION_2_NAME = "Elections28-55";


async function compareAddress(row, orbsPos) {
	// we have two previous distributions
	let total = await orbsPos.getRewards(row.address)
	let rawTotal = total.delegatorReward + total.guardianReward + total.validatorReward;
	let pending = rawTotal - row.firstDist - row.secondDist;
	let diffCalc = row.pending - pending; 
	if (argv.forDist) {
		diffCalc = pending;
	}
	return {
		address: row.address,
		diff: diffCalc
	}
}

async function iterateFile(filename, orbsPos) {
	// return new Promise((resolve,reject) => {
		let results = [];
		let queue = [];
		let parallelism = 20;

		let file = fs.readFileSync(filename);
		let records = csv(file);

		for (let i = 1; i < records.length; i++) {
			if (queue.length == 10) {
				await Promise.all(queue).then((arr) => {
					for (r of arr) {
						console.log(r);
						results.push(r);
					}
				})

				queue = [];
			}

			let data = {
				address: records[i][0],
				firstDist: records[i][1],
				secondDist: records[i][2],
				pending: records[i][3] 
			}
			let p = compareAddress(data, orbsPos);
			
			queue.push(p);
		}

		await Promise.all(queue).then((arr) => {
			for (r of arr) {
				console.log(r);
				results.push(r);
			}
		})

		return results;


		// let readStream = fs.createReadStream(filename)
		//   .pipe(csv())
		//   .on('data', (row) => {
		//   	console.log(row);
		//   	let x = compareAddress(row, orbsPos);
		//   	queue.push(x);
		//   	x.then((result) => { console.log(result); results.push(result); });
		//   })
		//   .on('end', () => { console.log("too soon"); Promise.all(queue).then(resolve(results)); });
// 	})
}

function getOrbsPOS(endpoint, vchain) {
	const ethereumProviderUrl = 'https://mainnet.infura.io/v3/55322c8f5b9440f0940a37a3646eac76';	// The Ethereum that we will query
	const web3 = new Web3(new Web3.providers.HttpProvider(ethereumProviderUrl));	

	const URL = `http://${endpoint}/vchains/${vchain}`;
	const signer = orbsClient.createAccount();
	const client = new orbsClient.Client(URL, vchain, orbsClient.NetworkType.NETWORK_TYPE_MAIN_NET, new orbsClient.LocalSigner(signer));
	return orbsPos.orbsPOSDataServiceFactory(web3, client);
}
// 18.197.127.2

// not used
async function getValidators() {
	var pos = getOrbsPOS("18.197.127.2", 1100000);
	var v = await pos.getValidators();
	return v;
}

function formatoutput(results) {
	csvStr = "address,diff\n"
	if (argv.forDist) {
		csvStr = "address,total_rewards\n"
	}

	for(let result of results) {
	  csvStr += `${result.address},${result.diff}\n`;
	}
	return csvStr;
}

var pos = getOrbsPOS("18.197.127.2", 1100000);
var result = iterateFile(argv.source, pos).then((r) => fs.writeFileSync(argv.output, formatoutput(r)));
