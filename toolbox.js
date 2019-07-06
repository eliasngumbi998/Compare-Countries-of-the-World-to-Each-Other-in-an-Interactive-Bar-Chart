/*---------------------------------------------------------
	Michael Finnegan, Tuesday 2nd to Sunday 7th July 2019.
	This file is part of my Kerry ETB data visualisation project.
	This is a set of methods in a class to help with the data visualisation.
*/
class Toolbox {

	constructor(filename) {
		this.filename = filename;
		this.that = this;
		this.matrix = []; //This 2 dimensional array will hold the countries rows and columns of data.
		this.message = 'empty';
		this.keys = [];
		this.chartTitles = [
			'Population',
			'Area per square mile',
			'Population density per square mile',
			'Gross Domestic Product per capita',
			'Level of literacy as a percentage of the population',
			'Phone lines per 1,000 people',
		];

	} //End constructor

	/*-----------------------------------------------------
		Test the matrix to see if there is anything in it.
	*/
	testMatrix() {
		var rows = this.matrix.length;
		var cols = 0;
		if (rows > 0) {
			//How many keys are there in the header line of the matrix?
			cols = Object.keys(this.matrix[0]).length;
		}
		if (rows == 0 || cols == 0) {
			this.message = 'empty';
		} else {
			this.message = 'rows: ' + rows + ', cols: ' + cols;
		}
		return;
	}
	/*-----------------------------------------------------
		After the matrix has been created from the data in the csv file,
		you can call this test function to see if the data will display correctly
		in a HTML table. If not then there is something wrong with the data.
		This function is here purely for debugging purposes.
		divId = 'output-panel'
    */
	testDisplayTable(divId) {

		var table_data = '<table class="table table-bordered table-striped">';
		var rows = this.matrix.length,
			cell_data, cols, row, col, cells_data, table_data, kn, keys;

		//Setup the header names row
		keys = Object.keys(this.matrix[0]);
		cols = keys.length;
		table_data += '<tr>';
		for (col = 0; col < cols; col += 1) {
			table_data += '<th>' + keys[col] + '</th>';
		}
		table_data += '</tr>';

		//Setup all the body rows and columns.
		for (row = 0; row < rows; row += 1) {

			cells_data = this.matrix[row];
			cols = Object.keys(this.matrix[row]).length;
			table_data += '<tr>';
			for (col = 0; col < cols; col += 1) {
				kn = keys[col];
				table_data += '<td>' + cells_data[kn] + '</td>'
			}

			table_data += '</tr>';
		}

		table_data += '</table>';
		$('#' + divId).html(table_data);

	}

	/*-----------------------------------------------------
		Read in a the data from the csv file.
		Create a two dimensional matrix and store in this.matrix.
		Each row of the matrix contains key/value pairs.
		The is an example of the first row:
		this.matrix[0]['country'], this.matrix[0]['population'], etc.
	 */
	createCountriesMatrix() {

		$.extend({
			xResponse: function(url) {
				// local var
				var theResponse = null;
				// jQuery ajax
				$.ajax({
					url: url,
					dataType: "text",
					async: false,
					success: function(data) {

						var countries_data = data.split(/\r?\n|\r/);
						var arr = [],
							keys = [],
							rows = countries_data.length,
							cells_data = countries_data[0].split(",");
						var cols = cells_data.length,
							row, col;
						var line = {};

						//Put the column names into the keys array.							
						for (col = 0; col < cols; col += 1) {
							keys.push(cells_data[col]);
						}

						for (row = 1; row < rows; row++) {
							cells_data = countries_data[row].split(",");
							cols = cells_data.length;
							line = {};
							for (col = 0; col < cols; col += 1) {
								let kn = keys[col];
								line[kn] = cells_data[col];
							}
							arr.push(line);

						}
						theResponse = arr;

					} //End success function
				}); //end $.ajax()
				// Return the response text
				return theResponse;
			}
		});

		this.matrix = $.xResponse('data/countries.csv');
		//The keys are repeated throughout each row of the matrix
		//because each row contains an array of 8 key/value pairs
		this.keys = Object.keys(this.matrix[0]);
		this.testMatrix();
		return;

	} //End createCountriesMatrix

	/*-----------------------------------------------------
		Create a dynamic drop-down list box.
		divId = where to position it.
		selIndex = the default item country to appear as selected.
		listName = the name to put inside the <select> tag that 
		embraces all the countries options inner tags.
	*/
	createDropDownList(divId, selIndex, listName) {
		var rows = this.matrix.length,
			cols = Object.keys(this.matrix[0]).length,
			row, col, line, country, option;

		var ddList = '<select onchange="btnCompareClick()" size="1" name="' + listName + '">';

		for (row = 0; row < rows; row += 1) {
			country = this.matrix[row]['country'];
			option = '<option ';
			if (selIndex == row) {
				option = '<option selected ';
			}

			line = option + 'value="' + row + '">' + country + '</option>';
			ddList += line;
		}
		ddList += '</select>';
		$('#' + divId).html(ddList);

	}
	/*-----------------------------------------------------
		input parameters:
			chartDiv: the div in the HTML where the chart is to appear.
			chartData: an array of 8 objects. Each object represents the data for a bar in the chart.
			example:
				chartData = [
					{ country: "Ireland", population: 4062235 },
					{ country: "Croatia", population: 4494749 },
					{ country: "Bulgaria", population: 7385367 },
					{ country: "Germany", population: 82422299 },
					{ country: "French Guiana", population: 199509 },
					{ country: "French Polynesia", population: 274578 },
					{ country: "Jersey", population: 91084 },
					{ country: "Israel", population: 6352117 },
				];
		yKey: the name of the key that represents the y-axis of one of the bars in the chart.
				it cound be either one of ['population','area','density','gdp','literacy','phones'];

	*/
	displayBarchart(titleId, chartDiv, chartData, yKey, barchartRadio) {


		var chartDivObj = document.getElementById(chartDiv);
		var outerWidth = chartDivObj.clientWidth;
		var outerHeight = chartDivObj.clientHeight;
		var margin = {
			left: 90,
			top: 16,
			right: 30,
			bottom: 85
		};
		var barPadding = 0.2;
		$('#' + titleId).contents()[0].nodeValue = this.chartTitles[barchartRadio];



		var xColumn = "country"; //On a given bar the xColumn Will display the value associated with the key "country"
		var yColumn = yKey; //The value associated with the "population" key
		var colorColumn = "country";

		var innerWidth = outerWidth - margin.left - margin.right;
		var innerHeight = outerHeight - margin.top - margin.bottom;
		document.getElementById(chartDiv).innerHTML = "";
		var svg = d3.select(chartDivObj).append("svg")
			.attr("width", outerWidth)
			.attr("height", outerHeight);
		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var xAxisG = g.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + innerHeight + ")");
		var yAxisG = g.append("g")
			.attr("class", "y axis");

		var xScale = d3.scale.ordinal().rangeBands([0, innerWidth], barPadding);
		var yScale = d3.scale.linear().range([innerHeight, 0]);
		var colorScale = d3.scale.category10();

		// Use a modified SI formatter that uses "B" for Billion.
		var siFormat = d3.format("s");
		var customTickFormat = function(d) {
			return siFormat(d).replace("G", "B");
		};

		var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
			.outerTickSize(0);
		var yAxis = d3.svg.axis().scale(yScale).orient("left")
			.ticks(10)
			.tickFormat(customTickFormat)
			.outerTickSize(0);

		function render(data) {

			//console.log(data);

			xScale.domain(data.map(function(d) {
				return d[xColumn];
			}));
			yScale.domain([0, d3.max(data, function(d) {
				return d[yColumn];
			})]);
			colorScale.domain(data.map(function(d) {
				return d[colorColumn];
			}));

			xAxisG
				.call(xAxis)
				.selectAll("text")
				.attr("dx", "-0.4em")
				.attr("dy", "1.24em")
				.attr("transform", "rotate(-16)");

			yAxisG.call(yAxis);

			var bars = g.selectAll("rect").data(data);
			bars.enter().append("rect")
				.attr("width", xScale.rangeBand());
			bars
				.attr("x", function(d) {
					return xScale(d[xColumn]);
				})
				.attr("y", function(d) {
					return yScale(d[yColumn]);
				})
				.attr("height", function(d) {
					return innerHeight - yScale(d[yColumn]);
				})
				.attr("fill", function(d) {
					return colorScale(d[colorColumn]);
				});
			bars.exit().remove();
		}

		function type(d, i) {

			d[yKey] = +d[yKey];
			return d;
		}

		render(chartData);
	}
	/*-----------------------------------------------------
		Create an array containing 8 objects.
		Each object will represent the data of a user-chosen country.
		Each of the 8 countries will have two sets of key/value pairs.
		Example of array returned by this function:
				 [
					{ country: "Ireland", population: 4062235 },
					​{ country: "Croatia", population: 4494749 },
					​{ country: "Bulgaria", population: 7385367 },
					​{ country: "Germany", population: 82422299 },
					​{ country: "French Guiana", population: 199509 },
					​{ country: "French Polynesia", population: 274578 },
					​{ country: "Jersey", population: 91084 },
					​{ country: "Israel", population: 6352117 },
​				];
		countryIndexes is an array of 8 numbers is the range 0..227
	*/
	createChosenCountriesArray(countryIndexes, barchartRadio) {

		//console.log(countryIndexes);
		var countriesArr = Array(8);
		var obj, countryValue, countryName, index;
		var bTypes = ['population', 'area', 'density', 'gdp', 'literacy', 'phones'];
		var bType = bTypes[barchartRadio],
			k1, v1, k2, v2;

		for (let i = 0; i < 8; i += 1) {
			obj = {};
			index = countryIndexes[i];
			k1 = 'country';
			v1 = this.matrix[index][k1];	//Get name of country based on index value. 
											//The index is the row 0..227 to access that country's name.
			v1 = v1.trim();					//the country's name is found using -->  this.matrix[index]['country'] 
											//A reverse lookup would be to find the index of that country 
											//given the country's name.

			k2 = bType;						//bType = one of the column headings 
											//'population','area','density','gdp','literacy','phones' 
			v2 = +this.matrix[index][bType]; //get a value for this key
			if (typeof v2 == 'string') {
				v2 = v2.trim();
			}
			obj[k1] = v1;
			obj[k2] = v2;
			countriesArr[i] = obj;
		}
		return countriesArr;
	}
	/*-----------------------------------------------------
		Generate a type of comparsion barchart based on the 
		whichever radio button was selected. (0..5). 
		0. Population, 1. Area, 2. Population density, 3. GDP, 4. Literacy, 5. phones
	*/
	generateBarchart(titleId, chartDiv, countryIndexes, barchartRadio) {

		var yKeys = ['population', 'area', 'density', 'gdp', 'literacy', 'phones'];
		var yKey = yKeys[barchartRadio];
		var countryName;

		var chosenData = this.createChosenCountriesArray(countryIndexes, barchartRadio);
		//console.log(chosenData, yKey);
		this.displayBarchart(titleId, chartDiv, chosenData, yKey, barchartRadio);

		return false;
	}
	/*-----------------------------------------------------
		Rearrange the positions the row indexes in decending order in the array of 8 numbers,
		because we are going to be sorting the countries in decending order both
		in the bar chart and in the actual 8 list box placements from left to right.  
	*/
	doSort(titleId, chartDiv, countryIndexes, barchartRadio) {

		var yKeys = ['population', 'area', 'density', 'gdp', 'literacy', 'phones'];
		var yKey = yKeys[barchartRadio];
		var countryName, index;
		var indexesFromName = Array(8);

		var chosenData = this.createChosenCountriesArray(countryIndexes, barchartRadio);
		/*
				The chosenData looks like this:
				var chosenData=[ 
									{ country: "Ireland", gdp: 29600 },
									{ country: "United Kingdom", gdp: 27700 },
									{ country: "France", gdp: 27600 },
									{ country: "Italy", gdp: 26700 },
									{ country: "Germany", gdp: 27600 },
									{ country: "Japan", gdp: 28200 }?,
									{ country: "Latvia", gdp: 10200 },
									{ country: "Russia", gdp: 8900 },
								];
		*/

		//Setup reverse lookup array. Given a country name return its row number 0..227

		for (let i = 0; i < 8; i += 1) {
			index = +countryIndexes[i];
			countryName = this.matrix[index]['country'].trim();
			indexesFromName[countryName] = index;
		}

		chosenData.sort((a, b) => (a[yKey] < b[yKey]) ? 1 : -1);
		//after doing the sort we need to reorder the countryIndexes array 
		//so that the indexes 0..227 match the order
		//in which the objects appear in chosenData. 
		//These indexes will be used so that the listboxes has the correct 
		//country selected and in the correct listbox order from  left to right.
		for (let i = 0; i < 8; i += 1) {
			countryName = chosenData[i]['country'];
			countryIndexes[i] = +indexesFromName[countryName];
			index = countryIndexes[i];
			this.createDropDownList('listBox' + (i + 1), +index, 'List' + (i + 1));
		}

		this.generateBarchart(titleId, chartDiv, countryIndexes, barchartRadio);

		return false;
	}
} //End Toolbox class