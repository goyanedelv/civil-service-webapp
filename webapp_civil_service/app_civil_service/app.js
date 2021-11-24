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
		stats[item['column']] = Number(item['$'])
	});

	return stats;
}

hclient.table('gov_electoral_data').row('2549693').get((error, value) => {
	console.info(rowToMap(value))
	console.info(value)
})

app.use(express.static('public'));
app.get('/delays.html',function (req, res) {
    const route=req.query['unique_id'] /*+ req.query['dest']*/;
    console.log(route);
	hclient.table('gov_electoral_data').row(route).get(function (err, cells) {
		const electoralInfo = rowToMap(cells);
		console.log(electoralInfo)
		function electoral_data(mapper) {
			var information = electoralInfo[mapper]/*weatherInfo["delay:" + weather + "_flights"];*/
			/*var delays = weatherInfo["delay:" + weather + "_delays"];*/
			/*if(flights == 0)
				return " - ";
			return (delays/flights).toFixed(1); *//* One decimal place */
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
	
app.listen(port);