var express = require('express');
var fs = require('fs');
var request = require('syncrequest');
var cheerio = require('cheerio');
var app     = express();
var tools = require('./app');

exports.scraping = function scraping() {

	// Get uri and tolerance from server.js
	var urlBonCoin = tools.Uri;
	var tolerance = tools.Tolerance.replace("%","");
	var deal="";

	//--------------------------------------------//
	//----------scrapping BONCOIN----------------//
	//-------------------------------------------//

	//url = 'https://www.leboncoin.fr/ventes_immobilieres/1087293645.htm?ca=7_s';

	var jsonBC = {
		prix: 0,
		ville: "",
		cp: 75000,
		type_bien :["Appartement", "Loft", "Duplex", "Triplex", "Maison", "Hotelp"],
		pieces: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "11", "12", "13", "14"
							, "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"],
		surface:0};

	var jsonMA = {
			type:"Maison", // by default
			prixm2moyen_appartement : 0,
			prixm2moyen_maison : 0
	}
	var options = {
    url: urlBonCoin,
    method: 'GET'
	};
	var res = request.sync(options)
	if(!res.response.error){
		var $ = cheerio.load(res.response.body);

		var prix, ville, type_bien, pieces, surface;

		//
		// Get values
		//

		// Prix
		// reste fixe
		if ("Prix"==$("#adview > section > section > section.properties.lineNegative > div:nth-child(5) > h2 > span.property").text())
			prix = $(".item_price")[0].attribs.content;
		else
			console.log("ERROR in scrapping the price");

		// ville
		// rest fixe
		if ("Ville"==$("#adview > section > section > section.properties.lineNegative > div.line.line_city > h2 > span.property > span").text()){
			var villeEntiere = $("#adview > section > section > section.properties.lineNegative > div.line.line_city > h2 > span.value").text();
			console.log("calcul++++"+villeEntiere.split(' ').length);
			ville = villeEntiere.split(" ")[0].toLowerCase().withoutAccent();
			var cp = villeEntiere.split(" ")[1].replace("\n","");
		}
		else
			console.log("ERROR in scrapping the city");


		for (var i = 0; i < 18; i++) {

			// Type bien
			if ("Type de bien"==$("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.property").text())
				type_bien= $("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.value").text();
			else
				type_bien= "Maison"; // by deafault

			// Pieces
			if ("Pieces"==$("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.property").text().replace("�","e"))
				pieces= $("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.value").text();
			else
				pieces = "7"; // by default

			// Surface
			if ("Surface"==$("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.property").text())
				surface= $("#adview > section > section > section.properties.lineNegative > div:nth-child("+i+") > h2 > span.value").text().replace("m2","").replace(" ","");
			else
				surface = 100;//by default
		}

		//
		// Control values
		//

		console.log("ville entiere : "+villeEntiere);
		console.log("ville : "+ ville);
		console.log("cp : "+ cp);
		console.log("type bien : "+type_bien);
		console.log("surface : "+surface);
		console.log("pieces : "+pieces);

		console.log("ville+++ "+ ville);
		if (ville==undefined) console.log("ERROR in getting the city from leboncoin.fr");
		else if (prix==undefined) console.log("ERROR in getting the price from leboncoin.fr");
		else if (type_bien==undefined) console.log("ERROR in getting the house type from leboncoin.fr");
		else if (pieces==undefined) console.log("ERROR in getting the number of pieces from leboncoin.fr");
		else if (surface==undefined) console.log("ERROR in getting the surface from leboncoin.fr");
		else{
			if (jsonBC.type_bien.indexOf(type_bien) === -1) console.log("ERROR with your house type : he does not match");
			else if (jsonBC.pieces.indexOf(pieces) === -1) console.log("ERROR with your number of pieces");
			else{
				jsonBC.prix = prix;
				jsonBC.ville = ville;
				jsonBC.cp = cp;
				jsonBC.type_bien = type_bien;
				jsonBC.pieces = pieces;
				jsonBC.surface = surface;


				//---------------------------------------------//
				//----------scrapping MEILLEURSAGENTS----------//
				//---------------------------------------------//


				console.log("jsonBC.ville "+ jsonBC.ville);
				console.log("jsonBC.cp "+ jsonBC.cp);

				urlMeilleursAgents = "https://www.meilleursagents.com/prix-immobilier/"+jsonBC.ville+"-"+jsonBC.cp+"/";
				console.log("urlMeilleursAgents : "+urlMeilleursAgents);
				var options2 = {
					url: urlMeilleursAgents,
					method: 'GET'
				};
				var res2 = request.sync(options2);
				if(!res2.response.error){
					var $ = cheerio.load(res2.response.body);

					var type, prixm2moyen_maison, prixm2moyen_appartement;

					// Get values
					var prixm2moyen_appartement = $("#synthese > div.prices-summary.baseline > "+
						"div.prices-summary__values > div:nth-child(2) > div.small-4.medium-2."+
						"columns.prices-summary__cell--median").text().replace(/\s+/g,"").replace("€","");

					var prixm2moyen_maison = $("#synthese > div.prices-summary.baseline > div.prices-"+
						"summary__values > div:nth-child(3) > div.small-4.medium-2.columns."+
						"prices-summary__cell--median").text().replace(/\s+/g,"").replace("€","");

					// console.log("prixm2moyen_appartement"+ prixm2moyen_appartement);
					// console.log("prixm2moyen_maison"+ prixm2moyen_maison);

					jsonMA.prixm2moyen_appartement = prixm2moyen_appartement;
					jsonMA.prixm2moyen_maison = prixm2moyen_maison;

					//---------------------------------------------//
					//------------------Calculate------------------//
					//---------------------------------------------//

					// problème dans calcul

					prixMeilleursAgents = jsonMA.prixm2moyen_maison*jsonBC.surface;
					console.log("jsonMA.prixm2moyen_maison"+ jsonMA.prixm2moyen_maison);
					console.log("jsonBC.surface"+ jsonBC.surface);
					console.log("prixMeilleursAgents"+prixMeilleursAgents);

					var prixMax = (tolerance/100)*prixMeilleursAgents+prixMeilleursAgents;
					console.log("prix : " + jsonBC.prix);
					console.log("prixMax : " + prixMax);
					//
					if (parseInt(jsonBC.prix)<=parseInt(prixMax))
						deal = "good";
					else if (parseInt(jsonBC.prix)>parseInt(prixMax)) // problème ici
						deal = "bad";
					else
						deal=  null;

					if (deal==null)
						console.log("********* ERROR with the result of the deal ");
					else
						console.log("********* It's a " + deal+ " deal according to MeilleursAgents **********");

				} // if (!error)
				else
					console.log('ERROR with your http request');


				fs.writeFile('./json/meilleursagents.json', JSON.stringify(jsonMA, null, 4), function(err){
					console.log('File successfully written! - Check the json/meilleursagents.json ');
				});


			} // else

		} // second else
	} // if (!error)
		else
			console.log("ERROR with your http request");




		fs.writeFile('./json/boncoin.json', JSON.stringify(jsonBC, null, 4), function(err){
			console.log('File successfully written! - Check the json/boncoin.json ');
		});


		var a = "éChâteau";

		console.log("a = "+a.withoutAccent());


		return deal;


	}




			String.prototype.withoutAccent = function(){
	    var accent = [
	        /[\300-\306]/g, /[\340-\346]/g, // A, a
	        /[\310-\313]/g, /[\350-\353]/g, // E, e
	        /[\314-\317]/g, /[\354-\357]/g, // I, i
	        /[\322-\330]/g, /[\362-\370]/g, // O, o
	        /[\331-\334]/g, /[\371-\374]/g, // U, u
	        /[\321]/g, /[\361]/g, // N, n
	        /[\307]/g, /[\347]/g, // C, c
	    ];
	    var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

	    var str = this;
	    for(var i = 0; i < accent.length; i++){
	        str = str.replace(accent[i], noaccent[i]);
	    }

	    return str;
	}
