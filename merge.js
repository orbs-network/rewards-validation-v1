var minimist = require('minimist');
var fs = require('fs');
var csv = require('csv-parser');

var argv = minimist(process.argv.slice(2), {
	string: [ 'source127', 'source2855', 'source5682' ],
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

if (argv.source5680 == undefined) {
	console.log(argv);
	console.log("missing 5682 file, add --source5682");
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

var futureDistStream = fs.createReadStream(argv.source5680)
	  .pipe(csv())
	  .on('data', (row) => {
	    if (alladdresses[row.address] == undefined) {
	  		alladdresses[row.address] = {};
	  	}
	    alladdresses[row.address].r5682 = row.total_rewards;
	  });

Promise.all([streamToPromise(firstDistStream), streamToPromise(secondDistStream)], streamToPromise(futureDistStream)).then(() => {
	csvStr = "address,firstDist,secondDist,pending\n"

for(let address of Object.keys(alladdresses)){
  let rewards = alladdresses[address];
  let r127 = 0, r2855 = 0, r5682 = 0;

  if (rewards.r127 != undefined) {
  	r127 = rewards.r127;
  }
  if (rewards.r2855 != undefined) {
  	r2855 = rewards.r2855;
  }
  if (rewards.r5680 != undefined) {
  	r5680 = rewards.r5682;
  }

  csvStr += `${address},${r127},${r2855},${r5682}\n`;
}

fs.writeFileSync("merged.csv", csvStr);
});


