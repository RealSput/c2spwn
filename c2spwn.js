const parser = require("@webassemblyjs/wast-parser");
const ps = require('prompt-sync');
const fetch = require('node-fetch');
const fs = require('fs');

const prompt = ps();

(async () => {
	let cpp2wast = async (code) => {
    // use wasmexplorer service, as it is the easiest way to convert WAT to SPWN imo
		let r = await fetch("https://wasmexplorer-service.herokuapp.com/service.php", {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"content-type": "application/x-www-form-urlencoded",
				"sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Linux\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "cross-site"
			},
			"referrer": "https://mbebenita.github.io/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": `input=${encodeURIComponent(code)}&action=cpp2wast&options=-std%3Dc%2B%2B11%20-Os`,
			"method": "POST",
			"mode": "cors",
			"credentials": "omit"
		});
		r = await r.text();
		return r;
	};
	
	let wast = await cpp2wast(fs.readFileSync(process.argv[2]));
	let ast = parser.parse(wast);

	let exports_ = {};

	let getFunc = () => {
		return exports_[Object.keys(exports_)[parseInt(prompt('What function would you like to convert to SPWN? \n\n' + Object.keys(exports_).map((x, i) => '> ' + (i + 1) + ': ' + x).join('\n') + '\n')) - 1]];
	}
	ast.body[0].fields.forEach(x => {
		let func = [];
		if (x.type == "Func") {
			x.body.forEach(x => {
				if (x.type == 'Instr') {
					x.args.forEach(x => {
						if (x.type == "Instr" && x.id == "get_local") {
							func.push({ opcode: "get_local", args: x.args.map(x => parseInt(x.value)) });
						}
					})
					func.push({
						opcode: x.object ? x.object + '.' + x.id : x.id,
						args: x.args.map(x => x.value || null).filter(x => x !== null)
					})
				}
			})
			exports_[x.name.value] = func;
		}
	})

	console.log(JSON.stringify(getFunc()));
})();
