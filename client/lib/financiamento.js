/**
 * @module client/lib/financiamento
 *
 * @description  Financiamento da Educação
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

$(document).ready(function() {

	Plotly.setPlotConfig({locale: 'pt-BR'}) // Setando configuração de localidade para o Plugin Plotly (Gerador de gráficos).

	let feature;
	let dadosFinanciamento;
	let layer = L.geoJson();
	let legend;

	const variables = {
        'Percentual Certificado':'item2_perc_cert'
	}

	/**
	 * @function getFeature
	 *
	 * @description Esta função é reponsável por capturar o objeto referente a área do município (feature)
	 * do objeto geoJSON.
	 * @param {Object} feature Área do município
	 * @return {Object} Área do município.
	 *
	 */
	function getFeature(feature){
		return feature
	}

	/**
	 * @function displayTabs
	 *
	 * @description Esta função controla os eventos de click das abas da tela de Financimento da Educação.
	 * Ao clicar sobre uma determinada aba, as outras serão ocultadas e somente a clicada será exposta.
	 *

	 *
	 * @param {HtmlElement} tab ID da aba clicada.
	 *
	 */
	function displayTabs(tab){
		switch(tab) {
			case 'grafico-tab':
				$('#home').hide();
				$('#receita').show();
				$('#despesa').hide();
				$('#outras').hide();
			    break;

			case 'grafico-desp-tab':
				$('#home').hide();
				$('#receita').hide();
				$('#despesa').show();
				$('#outras').hide();
			    break;

		    case 'grafico-outra-tab':
   				$('#home').hide();
				$('#receita').hide();
				$('#despesa').hide();
				$('#outras').show();
			    break;

		  	default:
		  		$('#home').show();
				$('#receita').hide();
				$('#despesa').hide();
				$('#outras').hide();
		}
	}

	/**
	 * @function addLegend
	 *
	 * @description Esta função é responsável por adicionar a legenda no canto inferior direito do mapa.
	 *
	 * @param {Object} map Objeto Leaflet
	 *
	 */
	function addLegend(map){
    	legend = L.control({position: 'bottomright'});
		legend.onAdd = function (map) {
		    var div = L.DomUtil.create('div', 'info legend'),
		        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
		        labels = [];
				    div.innerHTML =
					'<span style="font-weight: 600;">LEGENDA</span><br>' +
			        '<i style="background:#ff1a1a";></i><span style="font-weight: 500;"> <  25%</span><br>' +
			        '<i style="background:#29a329";></i><span style="font-weight: 500;"> &ge; 25%</span><br>' +
			        '<i style="background:#ffb84d";></i><span style="font-weight: 500;">Divergência entre TCM e STN</span><br>' +
			        '<i style="background:#cca300";></i><span style="font-weight: 500;">Sem certificação </span><br>'

		    return div;
		};
		legend.addTo(map);
	}

	/**
	 * @function sliderStepDynamics
	 *
	 * @description Esta função é responsável por capturar qualquer alteração na barra de anos localizado abaixo do mapa de Financimento da Educação.
	 * Caso haja alguma mudança de ano, será chamado o método que exibirá uma nova camada com os dados correspondente
	 * ao ano selecionado.
	 *
	 * @param {Object} map Objeto Leaflet
	 *
	 */
	function sliderStepDynamics(map){
		stepSlider.noUiSlider.on('update', function (values, handle) {
			setLayer(map)
		});
	}

	/**
	 * @function getYear
	 *
	 * @description Esta função é reponsável por filtrar as informações do município pelo ano informado na chamada do método.
	 *
	 * @param {Array} list Lista com os municípios do estado
	 * @param {Number} year Ano selecionado
	 * @return {Array} Lista de informações do município filtradas por ano.
	 *
	 */
	function getYear(list, year){

		if(list === undefined)
			return -1
		for(let i = 0; i < list.length; i++){
			if(list[i].ano == year)
				return list[i]
		}
	}

	/**
	 * @function getStyleFromPercentualCertificado
	 *
	 * @description Esta função é reponsável por definir a cor da área (polígono) do município no mapa conforme o percentual certificado.
	 * do objeto geoJSON.
	 *
	 * @param {Array} aggregateDataByyear Lista de informações do município filtradas por ano.
	 * @param {Number} value Valor do percentual do município
	 * @return {Object} Objeto com as informações do estilo do município.
	 *
	 */
	function getStyleFromPercentualCertificado(aggregateDataByyear, value){

		if(aggregateDataByyear[variables[value]] == 0 ) {
			return {
	        opacity: 0.4,
	        weight: 2,
	        fillOpacity: 1.9,
	        fillColor: "#ffb84d"
	    	};
		}else if(aggregateDataByyear[variables[value]] == 1) {
			return {
	        color: "#000000",
	        opacity: 0.4,
	        weight: 2,
	        fillOpacity: 1.9,
	        fillColor: "#cca300"
	    	};
		}else if(aggregateDataByyear[variables[value]] >= 25){
			return {
	        color: "#000000",
	        opacity: 0.4,
	        weight: 2,
	        fillOpacity: 1.9,
	        fillColor: "#29a329"
	    	};
		}
		else if(aggregateDataByyear[variables[value]] < 25) {
			return {
	        color: "#000000",
	        opacity: 0.4,
	        weight: 2,
	        fillOpacity: 1.9,
	        fillColor: "#ff1a1a"
	    	};
		}


	}

	/**
	 * @function styleMap
	 *
	 * @description Esta função define o estilo {cor, borda, opacidade e etc.} dos municípios apresentado no mapa.
	 *
	 * @param {Object} feat Feature do município.
	 * @return {Object} Objeto com as informações do estilo do município.
	 *
	 */
	function styleMap(feat){
		let value = "Percentual Certificado" ;

		let year = stepSlider.noUiSlider.get();
		let aggregateDataByyear = getYear(dadosFinanciamento[feat.properties.Nome], year);

		if(aggregateDataByyear === -1){
			return {
	        color: "#0000FF",
	        opacity: 0.2,
	        weight: 2,
	        fillOpacity: 1.9,
	        fillColor: "#dddddd"
	    	};
		}

		if(dadosFinanciamento[feat.properties.Nome] !== undefined){
			return getStyleFromPercentualCertificado(aggregateDataByyear, value);
		}
	}

	/**
	 * @function getYearsFromMun
	 *
	 * @description Esta função responsável por filtrar da lista de informações classificadas por ano,
	 * os anos de um determinado município.
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Array} Lista de anos do município.
	 *
	 */
	function getYearsFromMun(list){
		let years = [];
		for(let i = 0; i < list.length; i++){
			years.push(list[i].ano)
		}
		return years

	}

	/**
	 * @function getReceitaMde
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Receita do MDE (item1_mde).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor da Receita do MDE.
	 *
	 */
	function getReceitaMde(list){
		let receitaMde = [];
		for(let i = 0; i < list.length; i++){
			receitaMde.push(list[i].item1_mde)
		}
		return receitaMde
	}

	/**
	 * @function getReceitaFundeb
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Receita do FUNDEB (item1_fundeb).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor da Receita do FUNDEB.
	 *
	 */
	function getReceitaFundeb(list){
		let receitaFundeb = [];
		for(let i = 0; i < list.length; i++){
			receitaFundeb.push(list[i].item1_fundeb)
		}
		return receitaFundeb
	}

	/**
	 * @function getDespesaMdeEducacaoInfantil
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Despesa do MDE em Educação Infantil (itens3e4_mde_edu_inf).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor da Despesa do MDE em Educação Infantil.
	 *
	 */
	function getDespesaMdeEducacaoInfantil(list){
		let despesaMdeEducacaoInfantil = [];
		for(let i = 0; i < list.length; i++){
			despesaMdeEducacaoInfantil.push(list[i].itens3e4_mde_edu_inf)
		}
		return despesaMdeEducacaoInfantil
	}

	/**
	 * @function getDespesaMdeEducacaoFundamental
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Despesa do MDE em Educação Fundamental (itens3e4_mde_edu_fun).
	 *
	 * @param {Array} list lista de informações do município.
	 * @return {Number} Valor da Despesa do MDE em Educação Fundamental.
	 *
	 */
	function getDespesaMdeEducacaoFundamental(list){
		let despesaMdeEducacaoFundamental = [];
		for(let i = 0; i < list.length; i++){
			despesaMdeEducacaoFundamental.push(list[i].itens3e4_mde_edu_fun)
		}
		return despesaMdeEducacaoFundamental
	}

	/**
	 * @function getDespesaFundebPagMagisterio
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Despesa do FUNDEB com Magistério (itens3e4_fundeb_pag_mag).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor da Despesa do FUNDEB com Magistério.
	 *
	 */
	function getDespesaFundebPagMagisterio(list){
		let despesaFundebPagMagisterio = [];
		for(let i = 0; i < list.length; i++){
			despesaFundebPagMagisterio.push(list[i].itens3e4_fundeb_pag_mag)
		}
		return despesaFundebPagMagisterio
	}

	/**
	 * @function getDespesaFundebOutrasDespesas
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Despesa do FUNDEB com Outras Despesas (itens3e4_fundeb_outras_desp).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor da Despesa do FUNDEB com Outras Despesas.
	 *
	 */
	function getDespesaFundebOutrasDespesas(list){
		let despesaFundebOutrasDespesas = [];
		for(let i = 0; i < list.length; i++){
			despesaFundebOutrasDespesas.push(list[i].itens3e4_fundeb_outras_desp)
		}
		return despesaFundebOutrasDespesas
	}

	/**
	 * @function getDeducoesConstituicionais
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Deduções Constitucionais (dedu_const).
	 *
	 * @param {Array} list lista de informações do município.
	 * @return {Number} Valor das Deduções Constitucionais.
	 *
	 */
	function getDeducoesConstituicionais(list){
		let deducoesConstituicionais = [];
		for(let i = 0; i < list.length; i++){
			deducoesConstituicionais.push(list[i].dedu_const)
		}
		return deducoesConstituicionais
	}

	/**
	 * @function getPercentualCertificado
	 *
	 * @description Esta função responsável por filtrar da lista de informações do município,
	 * o valor correspondente a Pecentual Certificado (item2_perc_cert).
	 *
	 * @param {Array} list Lista de informações do município.
	 * @return {Number} Valor do Percentual Certificado.
	 *
	 */
	function getPercentualCertificado(list){
		let percentualCertificado = [];
		for(let i = 0; i < list.length; i++){
			percentualCertificado.push(list[i].item2_perc_cert)
		}
		return percentualCertificado
	}

	/**
	 * @function chartMaker
	 *
	 * @description Esta função é responsável por gerar o gráfico de Receitas do MDE e FUNDEB do município
	 *
	 */
	function chartMaker(){
		let municipalitie = $( "#municipality" ).val();
		//let variableValues = Object.values(variables);
		let years          = getYearsFromMun(dadosFinanciamento[municipalitie])
		let receitasMde    = getReceitaMde(dadosFinanciamento[municipalitie])
		let receitasFundeb = getReceitaFundeb(dadosFinanciamento[municipalitie])

		var trace1 = {
			x: years,
			y: receitasMde,
			type: 'scatter',
			hoverinfo: 'y',
			name: 'MDE',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var trace2 = {
			x: years,
			y: receitasFundeb,
			type: 'scatter',
			hoverinfo:'y',
			name: 'FUNDEB',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var layout = {
		    title: "<b>Receitas do MDE e FUNDEB do município de " + municipalitie + "<b>",
		    showlegend: true,

		    xaxis:{
		    	nticks: 2,
		    	tickformat: 'Y',
   				hoverformat: 'Y'

   			},
		    yaxis:{
		    	tickformat: ',.00'
		    },
			titlefont: {
			    size: 18,
			    family: 'BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'
			  }
		};

		var data = [trace1, trace2];

		Plotly.newPlot('myDiv', data, layout, {locale: 'pt-BR', responsive: true});
		/**
		 * @function toImage
		 * @description O trecho de código a seguir, criar a imagem do gráfico para ser utilizado pelo programa gerador de PDF
		 * do relatório do Financimento da Educação - Receitas do MDE e FUNDEB.
		 * Será criado um input do tipo hidden
		 * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
		 * @return    {Text} Imagem em base64
		 */
		Plotly.toImage('myDiv',{format:'jpeg', height:600, width:680}).then(function(response){
	        response = JSON.stringify(response);
	        $( "#graficoReceitas" ).remove();
	        $( "#myDiv" ).append("<input type='hidden' id='graficoReceitas' name='graficoReceitas' value="+response+">");
    	});
	}

	/**
	 * @function chartMakerDepesasEducacao
	 *
	 * @description Esta função é responsável por gerar o gráfico de Despesas do MDE e FUNDEB do município
	 *
	 */
	function chartMakerDepesasEducacao(){

		let municipalitie = $( "#municipality" ).val();
		let years                         = getYearsFromMun(dadosFinanciamento[municipalitie])
		let despesaMdeEducacaoInfantil    = getDespesaMdeEducacaoInfantil(dadosFinanciamento[municipalitie])
		let despesaMdeEducacaoFundamental = getDespesaMdeEducacaoFundamental(dadosFinanciamento[municipalitie])
		let despesaFundebPagMagisterio    = getDespesaFundebPagMagisterio(dadosFinanciamento[municipalitie])
		let despesaFundebOutrasDespesas   = getDespesaFundebOutrasDespesas(dadosFinanciamento[municipalitie])
		let deducoesConstituicionais      = getDeducoesConstituicionais(dadosFinanciamento[municipalitie])

		var trace1 = {
			x: years,
			y: despesaMdeEducacaoInfantil,
			type: 'scatter',
			hoverinfo: 'y',
			name: 'Educação Infantil',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var trace2 = {
			x: years,
			hoverinfo: 'y',
			y: despesaMdeEducacaoFundamental,
			type: 'scatter',
			name: 'Educação Fundamental',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var trace3 = {
			x: years,
			hoverinfo: 'y',
			y: despesaFundebPagMagisterio,
			type: 'scatter',
			name: 'Pagamentos Magistério',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var trace4 = {
			x: years,
			hoverinfo: 'y',
			y: despesaFundebOutrasDespesas,
			type: 'scatter',
			name: 'Outras Despesas',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var trace5 = {
			x: years,
			hoverinfo: 'y',
			y: deducoesConstituicionais,
			type: 'scatter',
			name: 'Dedução Constitucional',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var layout = {
		    title: "<b>Despesas do MDE e FUNDEB do município de " + municipalitie + "<b>",
		    showlegend: true,
		    xaxis:{
		    	nticks: 2,
		    	tickformat: 'Y',
   				hoverformat: 'Y'
   			},
 			yaxis:{
		    	tickformat: ',.00'
		    },
			titlefont: {
			    size: 18,
			    family: 'BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'
			  }
		};

		var data = [trace1, trace2, trace3, trace4, trace5];

		Plotly.newPlot('despesa', data, layout, {locale: 'pt-BR', responsive: true});
		/**
		 * @function toImage
		 * @description O trecho de código a seguir, criar a imagem do gráfico para ser utilizado pelo programa gerador de PDF
		 * do relatório do Financimento da Educação - Despesas do MDE e FUNDEB.
		 * Será criado um input do tipo hidden
		 * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
		 * @return    {Text} Imagem em base64
		 */
		Plotly.toImage('despesa',{format:'jpeg', height:500, width:700}).then(function(response){
	        response = JSON.stringify(response);
       		$( "#graficoDespesas" ).remove();
	        $( "#despesa" ).append("<input type='hidden' id='graficoDespesas' name='graficoDespesas' value="+response+">");
    	});
	}

	/**
	 * @function chartMakerOutrasInformacoes
	 *
	 * @description Esta função é responsável por gerar o gráfico de Percentual Certificado do município
	 *
	 */
	function chartMakerOutrasInformacoes(){
		let municipalitie = $( "#municipality" ).val();
		let years                         = getYearsFromMun(dadosFinanciamento[municipalitie])
		let percentualCertificado         = getPercentualCertificado(dadosFinanciamento[municipalitie])

		var trace1 = {
			x: years,
			y: percentualCertificado,
			type: 'scatter',
			name: 'Percentual Certificado',
			marker: {
		    	line: {
		        	width: 10
		        }
	    	}
		};

		var layout = {
		    title: "<b>Percentual Certificado do município de " + municipalitie + "<b>",
		    showlegend: true,
		    xaxis:{
		    	nticks: 2,
		    	tickformat: 'Y',
   				hoverformat: 'Y'
   			},
			titlefont: {
			    size: 18,
			    family: 'BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif'
			  }
		};

		var data = [trace1];

		Plotly.newPlot('outras', data, layout, {locale: 'pt-BR', responsive: true});
		/**
		 * @function toImage
		 * @description O trecho de código a seguir, criar a imagem do gráfico para ser utilizado pelo programa gerador de PDF
		 * do relatório do Financimento da Educação - Percentual Certificado.
		 * Será criado um input do tipo hidden
		 * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
		 * @return    {Text}  Imagem em base64
		 */
		Plotly.toImage('outras',{format:'jpeg', height:500, width:700}).then(function(response){
	        response = JSON.stringify(response);
            $("#graficoOutrasInfo").remove();
	        $("#outras").append("<input type='hidden' id='graficoOutrasInfo' name='graficoOutrasInfo' value="+response+">");
    	});

	}

	/**
	 * @function componentMaker
	 *
	 * @description Esta função é reponsável por montar a barra de anos abaixo do mapa conforme as informações existentes no
	 * banco de dados.
	 *
	 */
	function componentMaker(mymap){
		let years = []
		let municipalitie = feature[0].properties.Nome;
		let filtredFinanciamento = dadosFinanciamento[municipalitie];
		$("#municipality").val(municipalitie);

		let selectVariable = $('#variable');
		selectVariable.append($("<option/>").val(filtredFinanciamento[0].item2_perc_cert).text("Percentual Certificado"));

		let count = 0;

		for(let i = 0; i < filtredFinanciamento.length; i++){
			years.push(filtredFinanciamento[i].ano)
			count++
		}

		let min = Math.min.apply(Math, years)
		let max = Math.max.apply(Math, years)

		noUiSlider.create(stepSlider, {
	   		step: 1,
	   		snap: true,
	   		format: {
			    to: function ( value ) {
			    	return value;
			    },
			    from: function ( value ) {
			    	return value.replace(',-', '');
			    }
		    },
		    tooltips:true,
		    start: [ min ],
		    pips:  { mode: 'steps', stepped: true, density: 12, values: count },
		    range: {
	        	min: min,
	        	max: max
	   		},
		});

		sliderStepDynamics(mymap)
		poligonMap(mymap)

	}


	/**
	 * @function calculaDifMdeEFundeb
	 *
	 * @description Esta função responsável por calcular a diferença entre os valores despesa de educação infantil e fundamental.
	 * Essa informação será exibido quando o usuário pairar o cursor do mouse sobre os valores de educação infantil e fundamental
	 * na janela de informações do município.
	 *
	 * @param {Number} eduInf Valor da despesa de Educação Infantil.
	 * @param {Number} eduFun Valor da despesa de Educação Fundamental.
	 * @return {Text} Html com resultado dentro de um componente tooltip.
	 *
	 */
	function calculaDifMdeEFundeb(eduInf, eduFun){
		var diferenca  = 0;
		var percDif    = 0;

		if(eduInf > eduFun){
			diferenca = eduInf - eduFun;
			percDif = (diferenca / eduInf) * 100;
		}else{
			diferenca = eduFun - eduInf;
			percDif   = (diferenca / eduFun) * 100;
		}

		return " data-toggle='tooltip' "
			+  " data-html='true' "
			+  " title='Diferença entre as depesas de Educação Infantil e Educação Fundamental: R$ "+converterFloatReal(diferenca.toFixed(2))+". Percentual da diferença: "+converterFloatReal(percDif.toFixed(2))+"%'";
	}

	/**
	 * @function getColorFromPercentual
	 *
	 * @description Esta função responsável por definir a cor do valor de Percentual Certificado na janela de informações do município.
	 *
	 * @param {Number} perc Valor do percentual certificado do municipio.
	 * @return {Text} Cor conforme percentual informando
	 *
	 */
	function getColorFromPercentual(perc){
		if(perc >= 25){
			return "#29a329";
		}else if(perc < 25) {
			return "#ff1a1a";
		}else{
			return "black";
		}
	}

	/**
	 * @function montaTabelaPopUpFinanciamento
	 *
	 * @description Esta função responsável por montar a tabela de informações do município na janela acionada pelo PopUp.
	 *
	 * @param {Array} aggregateDataByyear Lista de informações do município filtradas por ano.
	 * @param {Object} la (layer) camada de exibição do mapa.
	 * @return {text} Tabela em html com as informaçãos do município.
	 *
	 */
	function montaTabelaPopUpFinanciamento(aggregateDataByyear, la){
		if(aggregateDataByyear.item2_perc_cert == 1){
			return "<b class='titleMunicipio' >Ano: "+aggregateDataByyear.ano+" -  Município: "+la.feature.properties.Nome+"</b> <p align='center'>Informações sem certificação em função da <br>ausência da prestação de contas de todos os meses do período.</p>";
		}else if (aggregateDataByyear.item2_perc_cert == 0){
			return " <b class='titleMunicipio' >Ano: "+aggregateDataByyear.ano+" -  Município: "+la.feature.properties.Nome+" </b> <p align='center'>Informações zeradas em função de divergência <br> entre valores informados ao TCM e STN.</p>";
		}else if(aggregateDataByyear.item2_perc_cert == undefined){
			return la.feature.properties.Nome+" </b> <p align='center'>Sem Informações.</p>";
		}

		return "<table style='font-size: 12.5px;' class='table table-responsive'>"
				+		"<thead>"
				+		"<tr>"
				+		  "<th colspan='2' class='titleMunicipio' align='center' scope='col'>Ano: "+aggregateDataByyear.ano+" -  Município: "+la.feature.properties.Nome+" </th> "
				+		"</tr>"
				+		"</thead>"
				+		"<tbody>"
				+		"<tr>"
				+		  "<td colspan='2' align='center' style='font-weight: bold;' >Receitas</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>MDE </td>"
				+		  "<td align='right' >"+converterFloatReal(aggregateDataByyear.item1_mde)+"</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>FUNDEB </td>"
				+		  "<td align='right' >"+converterFloatReal(aggregateDataByyear.item1_fundeb)+"</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td colspan='2' align='center' style='font-weight: bold;' >Despesas</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>MDE Educação Infantil </td>"
				+		  "<td align='right' "+ calculaDifMdeEFundeb(aggregateDataByyear.itens3e4_mde_edu_inf,	aggregateDataByyear.itens3e4_mde_edu_fun)+" >"+converterFloatReal(aggregateDataByyear.itens3e4_mde_edu_inf)+"</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>MDE Educação Fundamental </td>"
				+		  "<td align='right' "+ calculaDifMdeEFundeb(aggregateDataByyear.itens3e4_mde_edu_inf,	aggregateDataByyear.itens3e4_mde_edu_fun)+" >"+converterFloatReal(aggregateDataByyear.itens3e4_mde_edu_fun)+"</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>FUNDEB Pagamentos Magistério </td>"
				+		  "<td align='right'>"+ converterFloatReal(aggregateDataByyear.itens3e4_fundeb_pag_mag)+"</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>FUNDEB Outras Despesas </td>"
				+		  "<td align='right'>"+ converterFloatReal(aggregateDataByyear.itens3e4_fundeb_outras_desp)+"</td>"
				+		"</tr>"
			    +		"<tr>"
				+		  "<td>Dedução Constitucional</td>"
				+		  "<td align='right'>"+converterFloatReal(aggregateDataByyear.dedu_const)+"</td>"
				+		"</tr>"
			    +		"<tr>"
				+		  "<td colspan='2'>&nbsp;</td>"
				+		"</tr>"
				+		"<tr>"
				+		  "<td>Percentual Certificado</td>"
				+		  "<td style='font-weight: bold; color:"+getColorFromPercentual(aggregateDataByyear.item2_perc_cert)+"' align='right'>"+ converterFloatReal(aggregateDataByyear.item2_perc_cert)+"%</td>"
				+		"</tr>"
				+		"</tbody>"
				+ "</table>";

	}

	/**
	 * @function poligonMap
	 *
	 * @description Esta função responsável por definir as áreas (polígonos) dos municípios do estado no mapa.
	 *
	 * @param {Object} map Objeto Leaflet.
	 *
	 */
	function poligonMap(map){
		layer.addData(feature);

		layer.eachLayer(function (la) {
			let year = stepSlider.noUiSlider.get();
			let value =  "Percentual Certificado";

			let aggregateDataByyear = getYear(dadosFinanciamento[la.feature.properties.Nome], year);

			let popUpDadosMunicipio = new L.Popup({closeOnClick: false, autoClose: false})
                .setContent(montaTabelaPopUpFinanciamento(aggregateDataByyear, la));

			la.bindPopup(popUpDadosMunicipio);

			setEventMouseOverOnLayer(la, map);

		});

		layer.addTo(map);
		layer.setStyle(styleMap);

	}


	/**
	 * @function setLayer
	 *
	 * @description Esta função responsável por definir as áreas (polígonos) dos municípios do estado no mapa,
	 * quando houver troca de ano.
	 *
	 * @param {Object} map Objeto Leaflet.
	 *
	 */
	function setLayer(map){
   		$(".noUi-tooltip").prepend("<div class='titleAno'>Ano: </div>");
		layer.eachLayer(function (la) {

			let year = Math.floor(stepSlider.noUiSlider.get());
			let value =  "Percentual Certificado";

			let aggregateDataByyear = getYear(dadosFinanciamento[la.feature.properties.Nome], year);
			la.bindPopup(montaTabelaPopUpFinanciamento(aggregateDataByyear, la))
		});
		layer.setStyle(styleMap);
	}

	/**
	 * @function initMap
	 *
	 * @description Esta função responsável por criar o mapa por meio do plugin Leaflet no local especificado na página,
	 * neste caso, na div identificada pelo id  mapid.
	 *
	 * @param {Object} map Objeto Leaflet.
	 *
	 */
	function initMap(feature){

		let mymap = L.map('mapid').setView([-16.361508, -49.500561], 6.40);

		mymap.createPane('labels');

		mymap.getPane('labels').style.zIndex = 800;

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoiam9zZXVtYmVydG9tb3JlaXJhIiwiYSI6ImNqbDJuMDkyYjFzZnMzcnF4NHhtcXZjc2MifQ.t7kEbLAbmqBoewQvM5HgDg', {
		    attribution: 'CAO Educação e UTP Geoprocessamento - CATEP',
		    maxZoom: 18,
		    minZoom: 5,
		    id: 'mapbox.light',
		    accessToken: 'pk.eyJ1Ijoiam9zZXVtYmVydG9tb3JlaXJhIiwiYSI6ImNqbDJuMDkyYjFzZnMzcnF4NHhtcXZjc2MifQ.t7kEbLAbmqBoewQvM5HgDg'
		}).addTo(mymap);

		$(window).on("resize", function () {
			$("#mapid").height($(window).height()-400);
			mymap.invalidateSize();
		}).trigger("resize");

		mymap.addControl(new L.Control.Fullscreen());

		return mymap;

	}


	const stepSlider = document.getElementById('slider-step');

	/**
	 * @function promise
	 *
	 * @description O trecho de código abaixo controla praticamente todo fluxo da página, iniciando pela declaração da promise
	 * que busca via Ajax pelo método GET as features (polígonos dos municípios). Em seguida, pela mesma forma,
	 * busca-se os dados do financimento da educação e depois é realizado a ordenação deles.
	 *
	 */
	const promise = new Promise(function(resolve, reject) {

		const municipalities = $.get({
			url: "/geojson",
			dataType:"json",
			success: function(polygons){}
		});

		const dadosfinanciamento = $.get({
			url: "/financiamento",
			dataType:"json",
			success: function(dadosfinanciamento){}
		});

		$.when( municipalities, dadosfinanciamento ).done(function (polygons, dadosfinanciamento) {
			dadosFinanciamento = dadosfinanciamento[0]
			feature = polygons[0].features.filter(getFeature);
			feature.sort(function(a,b) {return (a.properties.Nome > b.properties.Nome) ? 1 : ((b.properties.Nome > a.properties.Nome) ? -1 : 0);} );
			resolve();
		});
	});

	/**
	 * Após a organização dos dados pelo código acima, será chamado as funções que realizam os procedimentos
	 * de configuração para exbição das informações dos municípios do estado.
	 *
	 */
	promise.then(function() {
		let mymap = initMap(feature);
		componentMaker(mymap)
		addLegend(mymap)
		chartMaker()
		chartMakerDepesasEducacao()
		chartMakerOutrasInformacoes()
		return mymap

	}).then(function(mymap){
		/**
		 * script para habilitar o tooltip
	 	 *
	 	 */
		$(function () {
	  		$('[data-toggle="tooltip"]').tooltip()
		})

		/**
		 * Este script monitora qualquer mudança na barra de anos, caso haja alguma alteração será chamada a função
		 * seta as informação para o ano corresponte.
	 	 *
	 	 */
		$('#slider-pips').slider({
			change: function(event, ui) {
	      		setLayer(mymap)
		    }
		})

		/**
		 * Este script monitora os eventos de seleção e focus do campo Busca por Município, caso seja digitado algum texto
	 	 * será retornado os municípios de contenham o texo infomado.
	 	 */
		$("#municipality").autocomplete({
		    source: Object.keys(dadosFinanciamento),
		    select: function( event, ui ) {
			    chartMaker()
			    chartMakerDepesasEducacao()
			    chartMakerOutrasInformacoes()
		    },
		    focus: function(e,ui){
		        $(this).val(ui.item.label);
		        return false;
   			}
	  	})
		/**
		 * Este script monitora os eventos de clique no botão Exibir Município Selecionado, caso haja algum clique nesse botão,
	 	 * será será exibido o município seleciondo juntamente com suas informações.
	 	 */
		let layerSelected;
	   	$( "#zoomin" ).click(function() {
	  	let municipalitie = $( "#municipality" ).val();
	  	layer.eachLayer(function (lay) {
			  if(lay.feature.properties.Nome === municipalitie){
			  	layerSelected = lay.setStyle({
            		'color': 'blue',
		            'weight': 5,
		            'opacity': 2
           		});
			  	mymap.fitBounds(lay.getBounds());
			  	layerSelected.openPopup()
			  }
			});

		})

		/**
		 *
		 * Código para capturar o evento de click nas abas da tela de Financimento da Educação.
		 *
		 */
		$(".nav-link").on('click', function(){
			displayTabs(this.id)
			chartMaker()
	        chartMakerDepesasEducacao()
			chartMakerOutrasInformacoes()
		})

  //  		/**
		//  * Código para capturar o evento de click nas abas da tela e chama os métodos de criação dos gráficos
		//  */
		// $(".nav-item").on('click', function(){
		// 	chartMaker()
	 //        chartMakerDepesasEducacao()
		// 	chartMakerOutrasInformacoes()
		// })

	   	/**
		 * Este script monitora os eventos de clique no botão Limpar Seleção, caso haja algum clique nesse botão,
	 	 * será removida a seleção do município e a visão do mapa sera ampliada.
	 	 */
		$( "#zoomout" ).click(function() {
		  	let municipalitie = $("#municipality").val();
		  	mymap.setView([-16.361508, -49.500561], 6.40);
		  	layerSelected.setStyle({
            		color: "#000000",
		        	opacity: 0.2,
		        	weight: 4
            });
            layerSelected.closePopup()
		})
		/**
		 * Este script monitora os eventos de clique no botão Gerar Relatório PDF, caso haja algum clique nesse botão,
	 	 * será acionado o programa que gerará o Relatório do Financimento da Educação em PDF.
	 	 */
		$("#gerarPdf").click(function() {
		  	let municipalitie = $("#municipality").val();
		  	geraPDF(dadosFinanciamento[municipalitie], municipalitie);
		})

	});

});


