var minimist = require('minimist');
var fs = require('fs');
var csv = require('csv-parser');

var argv = minimist(process.argv.slice(2), {
	string: [ 'source127', 'source2855', 'source5682', 'source83105' ],
	stopEarly: true
});


if (argv.source127 == undefined) {
	console.log(argv);
	console.log("missing 127 file, add --source127");
	process.exit(1);
}

if (argv.source2855 == undefined) {
	console.log(argv);
	console.log("missing 2855 file, add --source2855");
	process.exit(1);
}

if (argv.source5682 == undefined) {
	console.log(argv);
	console.log("missing 5682 file, add --source5682");
	process.exit(1);
}

if (argv.source83105 == undefined) {
	console.log(argv);
	console.log("missing 83105 file, add --source83105");
	process.exit(1);
}


var alladdresses = {};

function streamToPromise(stream) {
	return new Promise((resolve,reject) => {
		stream.on('end', () => { setTimeout(resolve, 1000) })
	})
}

var firstDistStream = fs.createReadStream(argv.source127)
	  .pipe(csv())
	  .on('data', (row) => {
	  	if (alladdresses[row.address] == undefined) {
	  		alladdresses[row.address] = {};
	  	}
	    alladdresses[row.address].r127 = row.total_rewards;
	  });

var secondDistStream = fs.createReadStream(argv.source2855)
	  .pipe(csv())
	  .on('data', (row) => {
	    if (alladdresses[row.address] == undefined) {
	  		alladdresses[row.address] = {};
	  	}
	    alladdresses[row.address].r2855 = row.total_rewards;
	  });

var thirdDistStream = fs.createReadStream(argv.source5682)
	  .pipe(csv())
	  .on('data', (row) => {
	    if (alladdresses[row.address] == undefined) {
	  		alladdresses[row.address] = {};
	  	}
	    alladdresses[row.address].r5682 = row.total_rewards;
	  });

var futureDistStream = fs.createReadStream(argv.source83105)
	  .pipe(csv())
	  .on('data', (row) => {
	    if (alladdresses[row.address] == undefined) {
	  		alladdresses[row.address] = {};
	  	}
	    alladdresses[row.address].r83105 = row.total_rewards;
	  });


Promise.all([streamToPromise(firstDistStream), streamToPromise(secondDistStream), streamToPromise(thirdDistStream), streamToPromise(futureDistStream)]).then(() => {
	csvStr = "address,firstDist,secondDist,thirdDist,pending\n"

for(let address of Object.keys(alladdresses)){
  let rewards = alladdresses[address];
  let r127 = 0, r2855 = 0, r5682 = 0, r83105 = 0;

  if (rewards.r127 != undefined) {
  	r127 = rewards.r127;
  }
  if (rewards.r2855 != undefined) {
  	r2855 = rewards.r2855;
  }
  if (rewards.r5682 != undefined) {
  	r5682 = rewards.r5682;
  }
  if (rewards.r83105 != undefined) {
  	r83105 = rewards.r83105;
  }

  csvStr += `${address},${r127},${r2855},${r5682},${r83105}\n`;
}

fs.writeFileSync("merged.csv", csvStr);
});


