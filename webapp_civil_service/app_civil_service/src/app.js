'use strict';
const http = require('http');
var assert = require('assert');
const express= require('express');
const app = express();

const mustache = require('mustache');

const filesystem = require('fs');
const url = require('url');
const port = Number(process.argv[2]);

const hbase = require('hbase')
var hclient = hbase({ host: process.argv[3], port: Number(process.argv[4])})

function rowToMap(row) {
	var stats = {}
	row.forEach(function (item) {
		stats[item['column']] = item['$']
	});

	return stats;
}

// First table
hclient.table('gov_electoral_data').row('10001064').get((error, value) => {
	console.info(rowToMap(value))
	console.info(value)
})

// Second table
hclient.table('gov_electoral_stats').row('Zapallar').get((error, value) => {
	console.info(rowToMap(value))
	console.info(value)
})

app.use(express.static('public'));
app.get('/delays.html',function (req, res) {
    const route=req.query['unique_id'];
    console.log(route);
	hclient.table('gov_electoral_data').row(route).get(function (err, cells) {
		const electoralInfo = rowToMap(cells);
		console.log(electoralInfo)
		function electoral_data(mapper) {
			var information = electoralInfo["elect:"+mapper];
			return information;
		}

		var template = filesystem.readFileSync("result.mustache").toString();

		var html = mustache.render(template,  {
			unique_id : req.query['unique_id'],
			full_name : electoral_data("full_name"),
			circunscripcion : electoral_data("circunscripcion"),
			partido : electoral_data("partido"),
			mesa : electoral_data("mesa"),
			locale : electoral_data("locale")
		});
		res.send(html);
	});
});

app.get('/get-stats.html',function (req, res) {
    const route=req.query['district_name'];
    console.log(route);
	hclient.table('gov_electoral_stats').row(route).get(function (err, cells) {
		const electoralInfo = rowToMap(cells);
		console.log(electoralInfo)
		function electoral_data(mapper) {
			var information = electoralInfo["stat:"+mapper];
			return information;
		}

		var template = filesystem.readFileSync("result_2.mustache").toString();

		var html = mustache.render(template,  {
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

	
app.listen(port);