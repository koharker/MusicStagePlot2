var centerX = 525;
var centerY = 550;
var seatScale = 1;
var customScale = 1;
var maxRows = 8;
var generateCode = false;
var showStands;
var rows;
var stands;
var chairs;
var labels;
var customRowFontSizes;
var standCoordinates;
var straightRows = 0;
var editingLabelRow;
var vcLoc = 0;
var vc = 0;

$(document).ready(function() {
	setLetterCheckbox();
	$.jCanvas({
		strokeStyle: '#000',
		strokeWidth: 2,
		x: centerX, y: centerY,
		inDegrees: false
	});
	$('input').change(drawChart);
	$('#code').unbind('change');
//	$('input').keyup(drawChart);
	$('#generate').click(drawChart);
	$('#loadlink').click(function() {
		$('#loadlink').addClass('hidden');
		$('#loadcontainer').removeClass('hidden');
	});
	$('#load').click(function() {
		loadChartFileText($('#loadcode').val(), false);
	});
	$('#fileinput').change(loadChartFile);
	$('#reset').click(reset);
	$('#guide_canvas').click(clickChart);
	$('#guide_canvas').dblclick(dblClickChart);
	$('#chknumbers').change(function() {
		setRestartCheckbox();
		drawChart();
	});
	$('#chkrestart').change(function() {
		setLetterCheckbox();
		drawChart();
	});
	$('#btnscaledown').click(function() {
		setCustomScale(-0.1);
		drawChart();
	});
	$('#btnscaleup').click(function() {
		setCustomScale(0.1);
		drawChart();
	});
	$('#btnrowlabelscaledown').click(function() {
		customRowFontSizes[editingLabelRow] *= 0.9;
		setCustomLabels();
	});
	$('#btnrowlabelscaleup').click(function() {
		customRowFontSizes[editingLabelRow] *= 1.111111111;
		setCustomLabels();
	});
	$('#btnstraightdown').click(function() {
		setStraight(-1);
		drawChart();
	});
	$('#btnstraightup').click(function() {
		setStraight(1);
		drawChart();
	});
	$('#chkstands').change(checkStands);
	$('#txtlabels').blur(setCustomLabels);
	$('#txtlabels').keypress(function(e) {
		if(e.which == 13)
			setCustomLabels();
	});
	$('#txtlabels').keydown(function(e) {
		if(e.keyCode == 38 || e.keyCode == 40) // up, down arrows
			setCustomLabels();
	});
	$('#btnlabeldone').click(editLabelsDone);

	$('#code').dblclick(function () {
		$(this).select();
	});
	$('#help').click(closeHelp);
	$('#helpcontents').click(function(e) { e.stopPropagation(); });
	$('#input_labels').hide();
	
	if(!window.FileReader) {
		$('#loadfilecontainer').hide();
		showCodeInput();
	}
	
	reset();
	checkStands();
	drawChart();
	loadUrlCode();
});

function drawChart() {
	$("canvas").clearCanvas();
	var showNumbers = $('#chknumbers').attr('checked') != null;
	var restartNumbering = $('#chkrestart').attr('checked') != null;
	var letterRows = $('#chkletters').attr('checked') != null;
	if(showNumbers)
		var n = 1;
	else
		var n = '';
	var a = '';
	readInputs();
	updateChairLabels();
	seatScale = Math.min(1, 7 / rows.length) * customScale;
	var step = 300 / (rows.length - 1)
	var row_length = 0;
	for(var row in rows) {
		if(restartNumbering)
			n = 1;
		if(letterRows)
			a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(row);
		var r = 350;
		if(rows.length > 1)
			r = 185 + step * row;
		if(row < rows.length - straightRows) {
			$('canvas').drawArc({ radius: r });
			var arc_length = Math.PI - .3 - (1 - r / 550)
			var angle_step = arc_length / (rows[row] - 1)
			var vcStep = angle_step * 1.2
			for(var i = 0; i < rows[row]; i++) {
				var t = 0;
				var vcT = 0;
/*				for (var j = 0; j < row[rows]; j++) {
					if (chairs[row][j].shape === "cello") {
						vc ++;
					};
				};*/
				if(rows[row] > 1) {
					//adjust for cello spacing here
					if (vc > 0) {
						var nonCelloAngleStep = angle_step - ((angle_step * 0.1) / rows[row]);
						if (chairs[row][i].shape === "cello") {
							vcLoc = i;
							var t = -1 * (-1 * arc_length / 2 + (nonCelloAngleStep * (i - 1) + vcStep));
							console.log(rows.length)
							console.log(rows.length - 1)
							console.log(rows[row] + "rows[row]")
							console.log((angle_step - ((angle_step * 0.1) / rows.length)) + "with row.length and " + (angle_step - ((angle_step * 0.1) / rows[row])) + "with rows[row]."  + (rows.length - 1) + " = rL - 1");
						} else if (i > vcLoc) {
							console.log(i + "chair and " + vcLoc + "vcLoc");
							var t = -1 * (-1 * arc_length / 2 + (nonCelloAngleStep* i) + vcStep);
						} else {
							var t = -1 * (-1 * arc_length / 2 + nonCelloAngleStep * i);
							/*for (var j = i; j >= 0; j--) {
								var vt = -1 * (-1 * arc_length / 2 + (angle_step * 0.9) * j);  //(1 - (0.1 * vc)/(rows.length - 1)))
								drawChair(r, vt, n, a, chairs[row][j]);
							}*/
						};
					} else {
						var t = -1 * (-1 * arc_length / 2 + (angle_step) * i);
					}
				}
				// Hide the arc under disabled chairs
				if(!chairs[row][i].enabled) {
					$('canvas').drawArc({
						radius: r,
						strokeStyle: '#fff',
						strokeWidth: 5,
						start: i == 0 ? Math.PI : ((t + angle_step * 0.55) * -1), // First chair, blank out entire arc to the left
						end: i == rows[row] - 1 ? Math.PI : ((t - angle_step * 0.55) * -1)  // Last chair, blank out entire arc to the right
					});
				}
				drawChair(r, t, n, a, chairs[row][i]);
				if(showStands) {
					drawStand(Math.max(r - step * 0.5, r - 35 * customScale), t, stands[row][i*2]);
					if(i != rows[row] - 1)
						drawStand(Math.max(r - step * 0.5, r - 35 * customScale), t - angle_step / 2, stands[row][i*2+1]);
				}
				if(showNumbers && chairs[row][i].enabled && chairs[row][i].label === false)
					n++;
			}
		} else {
			var y = centerY - r;
			if(!row_length) {
				if(rows.length > straightRows)
					row_length = r * 1.8;
				else
					row_length = 1000;
				
			}
			$('canvas').drawLine({ x1: centerX - row_length/2, y1: y, x2: centerX + row_length/2, y2: y });
			var x_step = (row_length - 100) / (rows[row] - 1)
			for(var i = 0; i < rows[row]; i++) {
				var x = centerX;
				if(rows[row] > 1)
					x = x_step * i + centerX - row_length/2 + 50;
				// Hide the line under disabled chairs
				if(!chairs[row][i].enabled) {
					$('canvas').drawLine({
						x1: i == 0 ? 0 : (x - x_step * 0.55), // First chair, blank out entire line to the left
						y1: y,
						x2: i == rows[row] - 1 ? centerX * 2 : (x + x_step * 0.55), // Last chair, blank out entire line to the right
						y2: y,
						strokeStyle: '#fff',
						strokeWidth: 5
					});
				}
				drawChairXY(x, y, 0, n, a, chairs[row][i]);
				if(showStands) {
					drawStandXY(x, Math.min(y + step * 0.5, y + 35 * customScale), stands[row][i*2]);
					if(i != rows[row] - 1)
						drawStandXY(x + x_step * 0.5, Math.min(y + step * 0.5, y + 35 * customScale), stands[row][i*2+1]);
				}
				if(showNumbers && chairs[row][i].enabled && chairs[row][i].label === false)
					n++;
			}
		}
	}
	if(showStands) {
		$('canvas').drawText({
			fillStyle: '#000',
			strokeStyle: '#fff',
			x: 66, y: 8,
			text: ' = music stand',
			font: 'normal 11pt Verdana, sans-serif'
		});
		$('canvas').drawLine({ x1: 2, y1: 2, x2: 12, y2: 12 });
		$('canvas').drawLine({ x1: 2, y1: 12, x2: 12, y2: 2 });
	}
	$('.title').html($('#title').val());
	if(generateCode)
		$('#code').attr('value', encode());
}

function drawChair(r, t, n, a, chair) {
	var x = centerX - Math.sin(t) * r;
	var y = centerY - Math.cos(t) * r;
	drawChairXY(x, y, t, n, a, chair);
}	
	
function drawChairXY(x, y, t, n, a, chair) {
	chair.x = x;
	chair.y = y;
	var fontSize = (chair.fontSize ? chair.fontSize : 1) * Math.round((a ? 14 : 16) * seatScale);
	// The black borders don't work in old Firefoxen.
	// So fake it by drawing two rectangles
	if(chair.enabled) {
		if(chair.shape === "sqr"){
			$('canvas').drawRect({
				fillStyle: '#000',
				strokeStyle: '#000',
				x: x, y: y,
				width: 40 * seatScale, height: 40 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 40 * seatScale - 4, height: 40 * seatScale - 4,
				angle: -1 * t
			});
			$('canvas').drawText({
				fillStyle: '#000',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y,
				text: chair.label === false ? a + n : chair.label,
				font: 'normal ' + fontSize + 'pt Verdana, sans-serif'
			});
		} else if(chair.shape === "circ"){
			$('canvas').drawArc({
				radius: 20 * seatScale,
				fillStyle: '#000',
				strokeStyle: '#000',
				strokeWidth: 5,
				x: x, y: y
			});
			$('canvas').drawArc({
				radius: 20 * seatScale - 3,
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y
			});
			$('canvas').drawText({
				fillStyle: '#000',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y,
				text: chair.label === false ? a + n : chair.label,
				font: 'normal ' + fontSize + 'pt Verdana, sans-serif'
			});
		} else if(chair.shape === "cello") {
			$('canvas').drawRect({
				fillStyle: '#000',
				strokeStyle: '#000',
				x: x, y: y,
				width: 46 * seatScale, height: 46 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 46 * seatScale - 12, height: 46 * seatScale - 12,
				angle: -1 * t
			});
			$('canvas').drawText({
				fillStyle: '#000',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y,
				text: chair.label === false ? a + n : chair.label,
				font: 'normal ' + fontSize + 'pt Verdana, sans-serif'
			});
		} else if(chair.shape === "snare") {
			$('canvas').drawEllipse({
				fillStyle: '#000',
				strokeStyle: '#000',
				strokeWidth: 5,
				width: 38 * seatScale, height: 10 * seatScale,
				x: x + Math.sin(t) * 9 * seatScale, y: y + Math.cos(t) * 9 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				width: 38 * seatScale - 4, height: 10 * seatScale - 4 ,
				x: x + Math.sin(t) * 9 * seatScale, y: y + Math.cos(t) * 9 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#000',
				strokeStyle: '#000',
				x: x, y: y,
				width: 40 * seatScale, height: 16 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 40 * seatScale - 4, height: 16 * seatScale +seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#000',
				strokeStyle: '#000',
				strokeWidth: 5,
				width: 38 * seatScale, height: 10 * seatScale,
				x: x - Math.sin(t) * 8 * seatScale, y: y - Math.cos(t) * 8 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				width: 38 * seatScale - 4, height: 10 * seatScale - 4 ,
				x: x - Math.sin(t) * 8 * seatScale, y: y - Math.cos(t) * 8 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawText({
				fillStyle: '#000',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y,
				text: chair.label === false ? a + n : chair.label,
				font: 'normal ' + fontSize + 'pt Verdana, sans-serif'
			});
		}
		
	} else {
		if(chair.shape === "sqr"){
			$('#guide_canvas').drawRect({
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				x: x, y: y,
				width: 40 * seatScale, height: 40 * seatScale,
				angle: -1 * t
			});
			$('#guide_canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 40 * seatScale - 4, height: 40 * seatScale - 4,
				angle: -1 * t
			});
		} else if (chair.shape === "circ") {
			$('#guide_canvas').drawArc({
				radius: 20 * seatScale,
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				strokeWidth: 5,
				x: x, y: y
			});
			$('#guide_canvas').drawArc({
				radius: 20 * seatScale - 3,
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				x: x, y: y
			});
		} else if (chair.shape === "cello") {
			$('#guide_canvas').drawRect({
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				x: x, y: y,
				width: 46 * seatScale, height: 46 * seatScale,
				angle: -1 * t
			});
			$('#guide_canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 46 * seatScale - 10, height: 46 * seatScale - 10,
				angle: -1 * t
			});
		} else if (chair.shape === "snare") {
			$('canvas').drawEllipse({
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				strokeWidth: 5,
				width: 38 * seatScale, height: 10 * seatScale,
				x: x + Math.sin(t) * 9 * seatScale, y: y + Math.cos(t) * 9 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				width: 38 * seatScale - 4, height: 10 * seatScale - 4 ,
				x: x + Math.sin(t) * 9 * seatScale, y: y + Math.cos(t) * 9 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				x: x, y: y,
				width: 40 * seatScale, height: 16 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawRect({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				x: x, y: y,
				width: 40 * seatScale - 4, height: 16 * seatScale +seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#CCC',
				strokeStyle: '#CCC',
				strokeWidth: 5,
				width: 38 * seatScale, height: 10 * seatScale,
				x: x - Math.sin(t) * 8 * seatScale, y: y - Math.cos(t) * 8 * seatScale,
				angle: -1 * t
			});
			$('canvas').drawEllipse({
				fillStyle: '#fff',
				strokeStyle: '#fff',
				strokeWidth: 5,
				width: 38 * seatScale - 4, height: 10 * seatScale - 4 ,
				x: x - Math.sin(t) * 8 * seatScale, y: y - Math.cos(t) * 8 * seatScale,
				angle: -1 * t
			});
		}
	}
	//console.log(x + ' ' + y + ' ' + t);
}

function drawStand(r, t, stand) {
	var x = centerX - Math.sin(t) * r;
	var y = centerY - Math.cos(t) * r;
	drawStandXY(x, y, stand);
}

function drawStandXY(x, y, stand) {
	stand.x = x;
	stand.y = y;
	// Again with the borders
	$('#guide_canvas').drawRect({
		fillStyle: '#999',
		strokeStyle: '#999',
		x: x, y: y,
		width: 7, height: 7
	});
	$('#guide_canvas').drawRect({
		fillStyle: '#fff',
		strokeStyle: '#fff',
		x: x, y: y,
		width: 6, height: 6
	});
	if(stand.enabled) {
		$('canvas').each(function() {
			$(this).drawLine({
				x1: x-5, y1: y-5,
				x2: x+5, y2: y+5
			});
			$(this).drawLine({
				x1: x-5, y1: y+5,
				x2: x+5, y2: y-5
			});
		});
	}
}

function clickChart(e) {
	var canvas = $('#guide_canvas');
	var scale = 1050 / canvas.width();
	var x = (e.pageX - canvas.offset().left) * scale;
	var y = (e.pageY - canvas.offset().top) * scale;
	for(var row in rows) {
		for(var c in chairs[row]) {
			var chair = chairs[row][c];
			if(chair.x > x - 18 && chair.x < x + 18 && chair.y > y - 18 && chair.y < y + 18 ) {
				chair.enabled = !chair.enabled;
				drawChart();
				break;
			}
		}
		if(!showStands)
			continue;
		for(var s in stands[row]) {
			var stand = stands[row][s];
			if(stand.x > x - 9 && stand.x < x + 9 && stand.y > y - 9 && stand.y < y + 9 ) {
				stand.enabled = !stand.enabled;
				drawChart();
				break;
			}
		}
	}
}

// Add double click
function dblClickChart(e) {
	var canvas = $('#guide_canvas');
	var scale = 1050 / canvas.width();
	var x = (e.pageX - canvas.offset().left) * scale;
	var y = (e.pageY - canvas.offset().top) * scale;
	for(var row in rows) {
		for(var c in chairs[row]) {
			var chair = chairs[row][c];
			if(chair.x > x - 18 && chair.x < x + 18 && chair.y > y - 18 && chair.y < y + 18 ) {
				if (chair.shape === "sqr"){
					chair.shape = "circ"
				} else if(chair.shape === "circ"){
					chair.shape = "cello";
					vc += 1;
				} else if(chair.shape === "cello"){
					chair.shape = "snare";
					vc -= 1;
				} else if(chair.shape === "snare"){
					chair.shape = "sqr";
				}
				drawChart();
				break;
			}
		}
	}
}




function readInputs() {
	rows = [];
	for(var i = maxRows - 1; i >= 0; i--) {
		var val = parseInt($('#row' + (i+1)).val());
		if(rows.length == 0 && !val)
			continue;
		if(!val)
			val = 0;
		rows.push(val);
		if(!chairs[i] || chairs[i].length != val) {
			chairs[i] = [];
			for(var j = 0; j < val; j ++) {
				chairs[i][j] = { enabled: true, x: 0, y: 0, label: false, fontSize: false, shape: "sqr" }; // Add "type"

			}
		}
		if(!stands[i] || stands[i].length != val * 2 - 1) {
			stands[i] = [];
			for(var j = 0; j < val * 2 - 1; j += 2) {
				stands[i][j] = { enabled: true, x: 0, y: 0 };
				if(j != val * 2 - 2)
					stands[i][j+1] = { enabled: false, x: 0, y: 0 };
			}
		}
	}
	rows.reverse();
	showStands = $('#chkstands').attr('checked');
	setStraight(0); // Re-run "max straight rows" logic in case rows were removed
}

function editLabels(row) {
	editingLabelRow = row - 1;
	$('#input_main').hide();
	$('#input_labels').show();
	$('#lblcustomrow').html(row);
	$('#txtlabels').val(labels[editingLabelRow] ? labels[editingLabelRow].join("\n") : "");
}

function setCustomLabels() {
	if ($('#txtlabels').val().trim() == "") {
		delete labels[editingLabelRow];
		delete customRowFontSizes[editingLabelRow];
	} else {
		labels[editingLabelRow] = $('#txtlabels').val().trim().replace(/\|/g, "").replace(/\r\n/g, "\n").replace("\r", "\n").split("\n");
		if(!customRowFontSizes[editingLabelRow])
			customRowFontSizes[editingLabelRow] = 0.7;
	}
	drawChart();
}

function updateChairLabels() {
	for(var row in rows) {
		var label = 0;
		for(var c in chairs[row]) {
			var chair = chairs[row][c];
			chair.fontSize = customRowFontSizes[row];
			if(labels[row]) {
				if (chair.enabled && chair.shape !== "snare") {
					chair.label = labels[row][label] ? labels[row][label] : "";
					label++;
				}
			} else if (!chair.enabled || chair.shape === "snare"){	// Make sure it knows that a snare drum is not a chair so it skips this number
				chair.label = false;
			}
		}
	}
}

function editLabelsDone() {
	$('#input_labels').hide();
	$('#input_main').show();
}

function addRow() {
	maxRows++;
	$('#rows').append("<p>Row " + maxRows + ": <input id='row" + maxRows + "' size='2' maxlength='2'></input><a class='editlabellink' href='javascript:editLabels(" + maxRows + ")'>Edit labels</a></p>");
	$('#row' + maxRows).change(drawChart);
}

function reset() {
	$('input:text').not('#loadcode').val('');
	$('input:checkbox').removeAttr('checked');
	$('#chknumbers').attr('checked', 'checked');
	checkStands();
	chairs = [];
	stands = [];
	standCoordinates = [];
	rows = [];
	labels = [];
	customRowFontSizes = [];
	customScale = 1;
	straightRows = 0;
	$('#scale').html('100');
	$('#straight').html('0');
	drawChart();
}

function setRestartCheckbox() {
	if($('#chknumbers').attr('checked')) {
		$('#lblrestart').removeClass('disabled');
		$('#chkrestart').removeAttr('disabled');
	} else {
		$('#lblrestart').addClass('disabled');
		$('#chkrestart').attr('disabled', 'disabled').removeAttr('checked')
	}
	setLetterCheckbox();
}

function setLetterCheckbox() {
	if($('#chkrestart').attr('checked')) {
		$('#lblletters').removeClass('disabled');
		$('#chkletters').removeAttr('disabled');
	} else {
		$('#lblletters').addClass('disabled');
		$('#chkletters').attr('disabled', 'disabled').removeAttr('checked')
	}
}

function checkStands() {
	if($('#chkstands').attr('checked')) {
		showStands = true;
		$('#helpstands').show();
	} else {
		showStands = false;
		$('#helpstands').hide();
	}	
	drawChart();
}

function setCustomScale(n) {
	customScale = Math.min(2, Math.max(0.5, (customScale + n).toFixed(1)));
	$('#scale').html(Math.round(customScale * 100));
}

function setStraight(n) {
	straightRows = Math.min(rows.length, Math.max(0, straightRows + n));
	$('#straight').html(straightRows);
}

function save() {
	$('#bottommessage').show().html("<span style='color: green;'>Please wait...</span>");
	$.post('save.php?action=save', {code: encode()}, null, 'text')
		.done(function(data) {
			$('#bottommessage').html("<span style='color: green;'>Click <a href='" + data + "'>here</a> to save the chart data file to your computer.<br>When you return to this page later, you can open the file by clicking the Load Saved Chart button at the top of the page.</span>");
		})
		.fail(function() {
			$('#bottommessage').hide();
			generateCode = true;
			drawChart();
			$('#helpsave').show();
		});
}

function email() {
	$('#bottommessage').show().html("<span style='color: green;'>Please wait...</span>");
	$.post('save.php?action=email', {code: encode()}, null, 'text')
		.done(function(data) {
			$('#bottommessage').hide();
			var subject = $('#title').val() ? encodeURIComponent($('#title').val()) : "Seating Chart";
			window.location.href = "mailto:?to=&subject=" + subject + "&body=" + encodeURIComponent("Here is a link to a seating chart I made: ") + data + "";
		})
		.fail(function() {
			$('#bottommessage').html("<span style='color: red;'>Sorry, there was an error generating a link to this chart.</span>");
		});
}

function showCodeInput() {
	$('#loadcodecontainer').show();
	$('#loadcodelabel').hide();
}

function loadChartFile() {
	var file = $(this)[0].files[0];
	var reader = new FileReader();
	reader.onload = function() {
		loadChartFileText(this.result, true);
	};
	reader.readAsText($(this)[0].files[0]);
}

function loadChartFileText(text, isFile) {
	text = text.replace(/\r\n/g, "\n").replace("\r", "\n").trim();
	var start = text.indexOf("-- BEGIN CHART DATA --\n") + 23;
	var end = text.indexOf("\n-- END CHART DATA --");
	if(start > -1 && end > -1) {
		text = text.substring(start, end);
	} else if (text.indexOf("\n") > -1) {
		$('#loadmessage').show().html('<br>' + (isFile ? 'The selected file' : 'The entered code') + ' does not contain valid chart data');
		return;
	}
	$('#loadmessage').hide();
	decode(text);
}

function loadUrlCode() {
	if(window.urlcodeerr)
		$('#loadmessage').show().html('<br>' + urlcodeerr);
	else if(window.urlcode)
		decode(urlcode);
}

function encode() {
	var code = '';
	if($('#chknumbers').attr('checked') == null)
		code += 'H';
	if($('#chkrestart').attr('checked') != null) {
		code = 'N';
		if($('#chkletters').attr('checked') != null)
			code += 'L'
	}

	if(customScale != 1.0)
		code += 'P' + Math.round(customScale * 100);

	code += 'R'
	var i = 0;
	var n = 0;
	for(var row in rows) {
		var val = rows[row].toString(10);
		if(val.length == 1)
			val = '0' + val;
		code += val;
	}
	if(showStands) {
		code += 'S';
		for(var row in rows) {
			for(var s in stands[row]) {
				if(stands[row][s].enabled) {
					var mask = 1 << i;
					n |= mask;
				}
				i++;
				if(i == 31) {
					code += (n.toString(36) + '.');
					i = n = 0;
				}
			}
		}
		code += (n.toString(36) + '.');
		code = code.slice(0, -1);
	}
	var rowSentinal = false;
	for(var row in rows) {
		for(var c in chairs[row]) {
			if(!chairs[row][c].enabled) {
				var rowval = row.toString(10);
				if(rowval.length == 1)
					rowval = '0' + rowval;
				var chairval = c.toString(10);
				if(chairval.length == 1)
					chairval = '0' + chairval;
				if(!rowSentinal) {
					rowSentinal = true;
					code += ',H';
				}
				code += rowval + chairval;
			}
		}
	}
	if(straightRows > 0) {
		code += ',T' + straightRows;
	}
	code = code.toUpperCase();
	
	var labelCode = "";
	for(var label in labels) {
		if(labels[label] && labels[label].length > 0)
			labelCode += "||" + label + ":" + (Math.round(customRowFontSizes[label] * 100) / 100) + "|" + labels[label].join("|");
		else
			labelCode += "||";
	}
	labelCode = labelCode.substring(2);
	if($('#title').val().length > 0)
		code += "|||" + $('#title').val();
	else if(labelCode.length > 0)
		code += "|||";	
	if(labelCode.length > 0)
		code += "|||" + labelCode;
		
	return code;
}

function decode(code) {
	reset();
	var parts = code.split("|||");
	code = parts[0];
	
	// Simple checkboxes
	var matches = code.match(/^([^R]*)/);
	if(matches != null && matches.length > 1) {
		if(matches[1].indexOf('H') > -1)
			$('#chknumbers').removeAttr('checked');
		if(matches[1].indexOf('N') > -1) {
			$('#chkrestart').attr('checked', 'checked');
			setLetterCheckbox();
			if(matches[1].indexOf('L') > -1)
				$('#chkletters').attr('checked', 'checked');
		}
	}

	// Seat scale
	var matches = code.match(/P(\d+)/);
	if(matches != null && matches.length > 1) {
		customScale = +((parseInt(matches[1], 10) / 100).toFixed(1));
		$('#scale').html(Math.round(customScale * 100));
	}

	// Rows
	var matches = code.match(/R([\d\.]*)/);
	if(matches != null && matches.length > 1) {
		var loadRows = [];
		for(var i = 0; i < matches[1].length; i+= 2) {
			if(i / 2 > 7)
				addRow();
			var val = matches[1].substring(i, i+2);
			//console.log(val);
			loadRows.push(parseInt(val, 10));
			$('#row' + (i/2+1)).val(val);
			chairs[i/2] = [];
			for(var j = 0; j < parseInt(val, 10); j++) {
				chairs[i/2][j] = { enabled: true, x: 0, y: 0, label: false, fontSize: false, shape: "sqr" };
			}
		}
	}

	// Stands
	var matches = code.match(/S([^,]*)/);
	if(matches != null && matches.length > 1) {
		var standParts = matches[1].split('.');
		var i = 0;
		var standPart = 0;
		var n = parseInt(standParts[0], 36);
		stands = [];
		for(var row in loadRows) {
			stands[row] = [];
			var val = loadRows[row];
			for(var j = 0; j < val * 2 - 1; j++) {
				var mask = 1 << i;
				stands[row][j] = { enabled: (n & mask) != 0, x: 0, y: 0 };
				i++;
				if(i == 31) {
					i = 0;
					standPart++;
					n = parseInt(standParts[standPart], 36);
				}
			}
		}
		$('#chkstands').attr('checked', 'checked');
		checkStands();
	}

	// Hidden chairs
	var matches = code.match(/,H([^,]*)/);
	if(matches != null && matches.length > 1) {
		var hidden = matches[1];
		for(var i = 0; i < hidden.length; i += 4) {
			var row   = parseInt(hidden.substring(i  , i+2), 10);
			var chair = parseInt(hidden.substring(i+2, i+4), 10);
			chairs[row][chair].enabled = false;
		}
	}
	
	// Straight rows
	var matches = code.match(/,T([^,]*)/);
	if(matches != null && matches.length > 1) {
		straightRows = parseInt(matches[1], 10);
	}
	
	// Chart title
	if(parts.length > 1)
		$('#title').val(parts[1]);
	
	// Custom labels
	if(parts.length > 2) {
		var rowLabels = parts[2].split("||");
		for(var row in rowLabels) {
			var rowParts = rowLabels[row].split("|");
			var rowNumber = parseInt(rowParts[0].split(":")[0], 10);
			var rowSize = parseFloat(rowParts[0].split(":")[1], 10);
			labels[rowNumber] = rowParts.slice(1);
			customRowFontSizes[rowNumber] = rowSize;
		}
	}
	
	drawChart();
}

function showHelp(highlight) {
	$('#help').show();
	if(highlight) {
		$('#' + highlight).css('background-color', 'yellow');
	}
}

function closeHelp() {
	$('#help').hide();
	$('#helpstyle *').css('background-color', '');
}
