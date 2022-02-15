//////////////////////////////////////////////////////////

				//USTAWIENIE//

//////////////////////////////////////////////////////////

var id_send_group = 100977; //grupa z której są wysyłane surowce
var id_target_group = 77511; //grupa do której trafiają surowce

//wejsc w produkcje np, wubrac dana grupe i się zmienia Link
//https://pl171.plemiona.pl/game.php?village=3267&screen=overview_villages&mode=prod&group=100977&
//po group= jest id danej grupy, które jest obecnie aktywna

//////////////////////////////////////////////////////////

var villages_info_send = [];
var villages_info_target = [];
var transport_table = [];

function httpGet(e) {
    var t = new XMLHttpRequest;
    return t.open("GET", e, !1), t.send(null), t.responseText
}

function sender(id) {

	let origin_id = transport_table[id][2];
	let origin_target = transport_table[id][4];

	let namePage="market";
	let createLink = {
		"ajaxaction": "map_send",
		"village" : origin_id
	};
	let data = {
		"target_id" : origin_target,
		"wood" : transport_table[id][5],
		"stone" : transport_table[id][6],
		"iron" : transport_table[id][7]
	};

	TribalWars.post(namePage, createLink, data, function(response) {
		UI.SuccessMessage(response.message, 1000)
	}, false);
	
	var name_row = "#wiersznr" + transport_table[id][0];
	$(name_row).remove();
}

function get_villages_info_target() {
	
	let n = "game.php?screen=overview_villages&mode=prod&group=" + id_target_group + "&page=-1&";
	document.body.innerHTML += `<div id='villages_info_target' hidden>${httpGet(n)}</div>`;

	//var villages = $('.quickedit-vn');
	var villages = $('#villages_info_target').find('.quickedit-vn');
	villages.each(function(key, village) {
		var $label = $(village).find('.quickedit-label');
		var $content = $(village).find('.quickedit-content');

		var village_id = $content.html().split('&')[0].split('=')[2];
		var village_name = $.trim($label.text());
			
		var originalFullName = $label.text();
		var coordinates = originalFullName.match(/[0-9]{1,}\|[0-9]{1,}/gi).pop();
		var coordX = coordinates.match(/[0-9]{1,}/);
		var coordY = String(coordinates.match(/\|[0-9]{1,}/)).substring(1);

		villages_info_target.push([coordX+"|"+coordY, village_id, village_name]);
	});

	document.getElementById("villages_info_target").remove()
}

function get_villages_info_send() {
	
	let n = "https://pl171.plemiona.pl/game.php?screen=overview_villages&mode=prod&group=" + id_send_group + "&page=-1&";
	document.body.innerHTML += `<div id='villages_info_send' hidden>${httpGet(n)}</div>`;

	//var villages = $('.quickedit-vn');
	var villages = $('#villages_info_send').find('#production_table').find('.nowrap');
	villages.each(function(key, village) {
		var $label = $(village).find('.quickedit-label');
		var $content = $(village).find('.quickedit-content');
		var $wood = $(village).find('.wood');
		var $stone = $(village).find('.stone');
		var $iron = $(village).find('.iron');
		var $trades = $(village).find('a');

		var village_id = $content.html().split('&')[0].split('=')[2];
		var village_name = $.trim($label.text());
		
		var wood = $wood.text().replace('.', '');
		var stone = $stone.text().replace('.', '');
		var iron = $iron.text().replace('.', '');
		
		var trades = $.trim($trades.text().split('K')[1].split('\n')[1].split('/')[0]);
			
		var originalFullName = $label.text();
		var coordinates = originalFullName.match(/[0-9]{1,}\|[0-9]{1,}/gi).pop();
		var coordX = coordinates.match(/[0-9]{1,}/);
		var coordY = String(coordinates.match(/\|[0-9]{1,}/)).substring(1);

		villages_info_send.push([coordX+"|"+coordY, village_id, wood, stone, iron, trades, village_name]);
	});

	document.getElementById("villages_info_send").remove()
}

function calculate() {
	
	for(var i = 0; i < villages_info_send.length; i++) {
		
		var max_sury = parseInt(villages_info_send[i][5]) * 1000;
        var d_drewno = parseInt(villages_info_send[i][2]);
        var d_glina = parseInt(villages_info_send[i][3]);
        var d_zelazo = parseInt(villages_info_send[i][4]);
		
		var dzielnik = 3;
		
		//console.log(max_sury);
		
		var b_drewno = Math.floor(max_sury/dzielnik) + max_sury%dzielnik;
		var b_glina = Math.floor(max_sury/dzielnik);
		var b_zelazo = Math.floor(max_sury/dzielnik);

		var drewno = 1;
		var glina = 1;
		var zelazo = 1;
		
		//pierwsze rozdanie
		if(b_drewno > d_drewno) {
			
			b_drewno = d_drewno;
			dzielnik = dzielnik - 1;
			drewno = 0;
		}

		if(b_glina > d_glina) {
			
			b_glina = d_glina;
			dzielnik = dzielnik - 1;
			glina = 0;
		}

		if(b_zelazo > d_zelazo) {
			
			b_zelazo = d_zelazo;
			dzielnik = dzielnik - 1;
			zelazo = 0;
		}

		//drugie rozdanie
		if(dzielnik == 2) {
			
			var sum_pozostale = max_sury - (b_drewno + b_glina + b_zelazo);

			var sura_2_1 = Math.floor(sum_pozostale/dzielnik) + sum_pozostale%dzielnik;
			var sura_2_2 = Math.floor(sum_pozostale/dzielnik);

			if(drewno == 1) {
				
				b_drewno = b_drewno + sura_2_1;
					if(b_drewno > d_drewno) {
						
						b_drewno = d_drewno;
						dzielnik = dzielnik - 1;
						drewno = 0;
					}
			}

			if(glina == 1) {
				
				b_glina = b_glina + sura_2_2;
					if(b_glina > d_glina) {
						
						b_glina = d_glina;
						dzielnik = dzielnik - 1;
						glina = 0;
					}
			}

			if(zelazo == 1) {
				
				b_zelazo = b_zelazo + sura_2_2;
					if(b_zelazo > d_zelazo) {
						
						b_zelazo = d_zelazo;
						dzielnik = dzielnik - 1;
						zelazo = 0;
					}
			}
		}

		//trzecie rozdanie
		if(dzielnik != 2 && dzielnik != 0)
			if(dzielnik == 1) {
				
				sum_pozostale = max_sury - (b_drewno + b_glina + b_zelazo);

				if(drewno == 1) {
					
					b_drewno = b_drewno + sum_pozostale;
						if(b_drewno > d_drewno) {
							
							b_drewno = d_drewno;
							dzielnik = dzielnik - 1;
							drewno = 0;
						}
				}

				if(glina == 1) {
					
					b_glina = b_glina + sum_pozostale;
						if(b_glina > d_glina) {
							
							b_glina = d_glina;
							dzielnik = dzielnik - 1;
							glina = 0;
						}
				}

				if(zelazo == 1) {
					
					b_zelazo = b_zelazo + sum_pozostale;
						if(b_zelazo > d_zelazo) {
							b_zelazo = d_zelazo;
							dzielnik = dzielnik - 1;
							zelazo = 0;
						}
				}
			}
			
			var wioska_do_wysylki = -1;
			var min_odlegnosc = 100000;

			for (var j = 0; j < villages_info_target.length; j++) {
				
				var x1 = parseInt(villages_info_send[i][0].split("|")[0]);
				var y1 = parseInt(villages_info_send[i][0].split("|")[1]);

				var x2 = parseInt(villages_info_target[j][0].split("|")[0]);
				var y2 = parseInt(villages_info_target[j][0].split("|")[1]);

				var odleglosc = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));

					if(odleglosc < min_odlegnosc) {
						
						min_odlegnosc = odleglosc;
						wioska_do_wysylki = j;
					}
			}
			
			transport_table.push([
				i ,
				villages_info_send[i][0], villages_info_send[i][1], 
				villages_info_target[wioska_do_wysylki][0], villages_info_target[wioska_do_wysylki][1], 
				b_drewno, b_glina, b_zelazo, min_odlegnosc,
				villages_info_send[i][6],villages_info_target[wioska_do_wysylki][2] ]);
	}
}

function create_table() { 
	const content = 
	`
	<table align="center" id="contentContainer" width="100%">
	<tbody>
	<tr>
	<td>
	<table class="content-border" width="100%" cellspacing="0">
	<tbody>
	<tr>
	<td id="inner-border">
	<table class="main" align="left">
	<tbody>
	<tr>
	<td id="content_value">
	<div id="paged_view_content">
		<table id="production_table" class="vis overview_table" width="100%">
			<thead>
				<tr>
					<th>Wioska wysyłająca</th>
					<th>Wioska docelowa</th>
					<th>Odległość</th>
					<th>Czas</th>
					<th>Ilość surki</th>
					<th>Przycisk xD</th>
				</tr>
			</thead>

			<tbody id="tutaj">
			
			</tbody>
		</table>
	</div>
	</td>
	</tr>
	</tbody>
	</table>
	</td>
	</tr>
	</tbody>
	</table>
	</td>
	</tr>
	</tbody>
	</table>
	<br>
	`


	$('#header_info').after(content);
}

function fill_table() { 

	var content = ` `;
	
	for (var i = 0; i < transport_table.length; i++) {
		content += `
		<tr class="nowrap ${i%2 == 0 ? 'row_a' : 'row_b'}" id = "wiersznr${transport_table[i][0]}">
				
			<td>
				<span class="quickedit-vn" data-id="${transport_table[i][2]}" data-length="32">
					<span class="quickedit-content">
						<a href="/game.php?village=${transport_table[i][2]}&amp;screen=overview" target="_blank">
							<span class="quickedit-label"> ${transport_table[i][9]} </span>
						</a>
					</span>
				</span>
			</td>
					
			<td>
				<span class="quickedit-vn" data-id="${transport_table[i][4]}" data-length="32">
					<span class="quickedit-content">
						<a href="/game.php?village=${transport_table[i][4]}&amp;screen=overview" target="_blank">
							<span class="quickedit-label"> ${transport_table[i][10]} </span>
						</a>
					</span>
				</span>
			</td>

			<td>
				${parseFloat(transport_table[i][8]).toFixed(2)}
			</td>
			
			<td>
				${Math.floor(parseInt(parseFloat(transport_table[i][8])*288) / 60) + ":" + (parseInt(parseFloat(transport_table[i][8])*288) % 60 ? parseInt(parseFloat(transport_table[i][8])*288) % 60 : '00')}
			</td>

			<td>
				<span class="res wood">${transport_table[i][5]}</span> 
				<span class="res stone">${transport_table[i][6]}</span>
				<span class="res iron">${transport_table[i][7]}</span>
			</td>
					
			<td>
				<center><input class="btn wyslij" type="submit" value="Wyślij" tabindex="8" onclick="sender(${transport_table[i][0]})"></center>
			</td>
		</tr>
		`
	}
	
	$('#tutaj').after(content);
}

get_villages_info_send();
get_villages_info_target();
calculate();

//console.log(villages_info_send);
//console.log(villages_info_target);
//console.log(transport_table);

create_table();
fill_table();