'use strict';
const http = require('http');
var assert = require('assert');
const express= require('express');
const app_2 = express();

const mustache_2 = require('mustache');

const filesystem = require('fs');
const url = require('url');
const port_2 = Number(process.argv[2]);

const hbase = require('hbase')
var hclient_2 = hbase({ host: process.argv[3], port: Number(process.argv[4])})

function rowToMap(row) {
	var stats = {}
	row.forEach(function (item) {
		stats[item['column']] = item['$']
	});

	return stats;
}

// Second table
hclient_2.table('gov_electoral_stats').row('Zapallar').get((error, value) => {
	console.info(rowToMap(value))
	console.info(value)
})

app_2.use(express.static('public'));
app_2.get('/get-stats.html',function (req, res) {
    const route=req.query['district_name'];
    console.log(route);
	hclient_2.table('gov_electoral_stats').row(route).get(function (err, cells) {
		const electoralInfo = rowToMap(cells);
		console.log(electoralInfo)
		function electoral_data(mapper) {
			var information = electoralInfo["stat:"+mapper];
			return information;
		}

		var template = filesystem.readFileSync("result_2.mustache").toString();

		var html = mustache_2.render(template,  {
			district_name : req.query['district_name'],
			registered : electoral_data("voted"),
			voters_last : electoral_data("voters"),
			share: Math.round(100*electoral_data("voters")/electoral_data("voted")),
			poverty_income: Math.round(100*electoral_data("poverty_income")),
			poverty_multi: Math.round(100*electoral_data("poverty_multi")),
			vulnerability: electoral_data("vulnerability")


		});
		res.send(html);
	});
});
	
app_2.listen(port_2);