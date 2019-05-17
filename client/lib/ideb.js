/**
 * @module client/lib/ideb
 *
 * @description Dados do IDEB
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

$(document).ready(function() {

    Plotly.setPlotConfig({ locale: 'pt-BR' }) // Setando configuração de localidade para o Plugin Plotly (Gerador de gráficos).

    let feature;
    let dadosIdeb;
    let layer = L.geoJson();
    let legend;

    const variables = {
        'Atingiu a meta': 'atingiu_meta'
    }

    /**
     * @function getFeature
     *
     * @description Esta função é reponsável por capturar o objeto referente a área do município (feature)
     * do objeto geoJSON.
     *
     * @param {Object} feature Área do município
     * @return {Object} feature (área do município)
     *
     */
    function getFeature(feature) {
        return feature
    }

    /**
     * @function getLegend
     *
     * @description Esta função é responsável por montar a legenda de dados do mapa.
     *
     * @return {text} legenda do mapa em html
     *
     */
    function getLegend() {
        var legend;

        legend = '<span style="font-weight: 600;">LEGENDA</span><br>' +
            '<i style="background:#00cc00";></i><span style="font-weight: 500;">Atendeu meta</span><br>' +
            '<i style="background:#e62e00";></i><span style="font-weight: 500;">Não atendeu meta</span><br>' +
            '<i style="background:#dddddd";></i><span style="font-weight: 500;">Sem Informações</span><br>'

        return legend;
    }


    /**
     * @function addLegend
     *
     * @description Esta função é responsável por adicionar a legenda no canto inferior direito do mapa.
     *
     * @param {Object} map Objeto Leaflet
     *
     */
    function addLegend(map) {
        legend = L.control({ position: 'bottomright' });
        legend.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = ['Legenda'];
            div.innerHTML = getLegend();
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
    function sliderStepDynamics(map) {
        stepSlider.noUiSlider.on('update', function(values, handle) {
            setLayer(map)
        });
    }

    /**
     * @function getYear
     *
     * @description Esta função é reponsável por filtrar as informações do município pelo ano informado e pela classe (Etapa Escolar)
     * na chamada do método.
     *
     * @param {Array} list Lista com os municípios do estado
     * @param {Number} year Ano selecionado
     * @return {Array} list lista de informações do município filtradas por ano.
     *
     */
    function getYear(list, year) {
        var classe = $("#classe option:selected").val();
        year = parseInt(year);
        var munSemValores = 0;
        var qtdeMun;


        if (list === undefined) {
            munSemValores++;
            return -1
        }
        var muns = [];
        for (let i = 0; i < list.length; i++) {
            if (year === undefined) {
                return -1;
            } else {
                if (list[i].ano == year && classe == list[i].classe) {
                    return list[i];
                }
            }
        }

    }

    /**
     * @function getStyleAtingiuMeta
     *
     * @description Esta função é reponsável por definir a cor da área (polígono) do município no mapa.
     *
     * @param {Array} aggregateDataByyear Lista de informações do município filtradas por ano.
     * @return {Object} Objeto com as informações do estilo do município.
     *
     */
    function getStyleAtingiuMeta(aggregateDataByyear) {
        let value = "Atingiu a meta";

        if (aggregateDataByyear[variables[value]] == 1) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#00cc00"
            };
        } else {

            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#e62e00"
            };
        }


    }

    /**
     * @function styleMap
     *
     * @description Esta função define o estilo {cor, borda, opacidade e etc.} dos municípios apresentado no mapa.
     *
     * @param {Object} feat Feature do município.
     * @return {object} Objeto com informações do estilo do município.
     *
     */
    function styleMap(feat) {
        let year = stepSlider.noUiSlider.get();
        let aggregateDataByyear = getYear(dadosIdeb[feat.properties.Nome], year);

        if (aggregateDataByyear === -1 || aggregateDataByyear == undefined) {
            return {
                color: "#000000",
                opacity: 0.2,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#dddddd"
            };
        } else if (aggregateDataByyear.indice <= 0 && aggregateDataByyear.meta >= 0) {
            return {
                color: "#000000",
                opacity: 0.2,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#dddddd"
            };
        }

        if (dadosIdeb[feat.properties.Nome] !== undefined) {
            return getStyleAtingiuMeta(aggregateDataByyear);
        }
    }

    /**
     * @function getYearsFromMun
     *
     * @description Esta função responsável por filtrar da lista de informações classificadas por ano,
     * os anos de um determinado município.
     *
     * @param {Array} list Lista de informações do município.
     * @return {Array} Lista anos do município.
     *
     */

    function getYearFromMun(list) {
        var classe = $("#classe option:selected").val();
        let years = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].classe == classe) {
                years.push(list[i].ano)
            }
        }
        return years

    }

    /**
     * @function getIDEB
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente da nota do IDEB (indice).
     *
     *
     * @param {Array} list Lista de informações do município.
     * @return {Number} Nota do IDEB.
     *
     */
    function getIDEB(list) {
        var classe = $("#classe option:selected").val();
        let IDEB = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].classe == classe) {
                IDEB.push(list[i].indice)
            }

        }
        return IDEB
    }


    /**
     * @function getMeta
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente da meta do IDEB (meta).
     *
     *
     * @param {Array} list Lista de informações do município.
     * @return {Number} Meta do IDEB.
     *
     */
    function getMeta(list) {
        var classe = $("#classe option:selected").val();
        let meta = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].classe == classe) {
                meta.push(list[i].meta)
            }
        }
        return meta
    }

    /**
     * @function getAtingiuMeta
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente do atributo atingiu nota (atingiu_meta).
     *
     *
     * @param {Array} list lista de informações do município.
     * @return {Text} Atributo que consta se a nota foi atingida ou não.
     *
     */
    function getAtingiuMeta(list) {
        var classe = $("#classe option:selected").val();
        let atingiuMeta = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].classe == classe) {
                atingiuMeta.push(list[i].atingiu_meta)
            }
        }
        return atingiuMeta
    }

    /**
     * @function chartMaker
     *
     * @description Esta função é responsável por gerar o gráfico da situação do município no IDEB
     *
     */
    function chartMaker() {
        let municipalitie = $("#municipality").val();

        let years = getYearFromMun(dadosIdeb[municipalitie])
        let IDEB = getIDEB(dadosIdeb[municipalitie])
        let meta = getMeta(dadosIdeb[municipalitie])

        var trace1 = {
            x: years,
            y: IDEB,
            hoverinfo: 'y',
            type: 'scatter',
            name: ' IDEB',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var trace2 = {
            x: years,
            y: meta,
            hoverinfo: 'y',
            type: 'scatter',
            name: ' meta',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var layout = {
            title: "<b> Situação do município " + municipalitie + " no IDEB<b>",
            showlegend: true,
            xaxis: {
                tickformat: 'Y',
                hoverformat: 'Y'
            },
            titlefont: {
                size: 16,
                family: 'Open Sans, verdana, arial, sans-serif'
            }
        };

        var data = [trace1, trace2];

        Plotly.newPlot('myDiv', data, layout, { locale: 'pt-BR', responsive: true });


        /**
         * @function toImage
         * @description O trecho de código a seguir, criar a imagem do gráfico para ser utilizado pelo programa gerador de PDF
         * do relatório do IDEB.
         * Será criado um input do tipo hidden
         * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
         * @return    {Text} Imagem em base64
         */
        Plotly.toImage('myDiv', { format: 'jpeg', height: 500, width: 950 }).then(function(response) {
            response = JSON.stringify(response);
            $("#graficoIdeb").remove();
            $("#myDiv").append("<input type='hidden' id='graficoIdeb' name='graficoIdeb' value=" + response + ">");
        });

    }

    /**
     * @function componentMaker
     *
     * @description Esta função é reponsável por montar a barra de anos abaixo do mapa conforme as informações existentes no
     * banco de dados.
     *
     */
    function componentMaker(mymap) {
        let years = []
        let municipalitie = feature[0].properties.Nome;
        let filterDadosIdeb = dadosIdeb[municipalitie];

        $("#municipality").val(municipalitie);

        let count = 0;

        for (let i = 0; i < filterDadosIdeb.length; i++) {
            years.push(filterDadosIdeb[i].ano)
            count++
        }

        let min = Math.min.apply(Math, years)
        let max = Math.max.apply(Math, years)

        noUiSlider.create(stepSlider, {
            range: {
                min: min,
                max: max
            },
            format: {
                to: function(value) {
                    return value;
                },
                from: function(value) {
                    return value.replace(',-', '');
                }
            },
            tooltips: true,
            step: 2,
            start: [min],
            connect: true,
            behaviour: 'tap-drag',
            pips: { mode: 'steps', stepped: true, density: 12, values: count }
        });

        sliderStepDynamics(mymap)
        poligonMap(mymap)

    }

    /**
	 * @function getTextMeta

     * @param {Number} meta Valor da meta.
	 * @return {Text}  texto  se meta for {0 - Não / 1 - Sim}
	 *
	 */
    function getTextMeta(meta) {
        var texto;
        if (meta == 1) {
            texto = "Sim";
        } else {
            texto = "Não";
        }

        return texto;
    }

    /**
     * @function getColorFromMeta
     *
     * @param {Number} meta Valor da meta
     * @return {Text} Oor conforme a meta atingida ou não
     *
     */
    function getColorFromMeta(meta) {
        if (meta == 1) {
            return "#00cc00";
        } else {
            return "#e62e00";
        }
    }

    /**
     * @function montaTabelaPopUpIdeb
     *
     * @description Esta função responsável por montar a tabela de informações do município na janela acionada pelo PopUp.
     *
     * @param {Array} aggregateDataByyear Lista de informações do município filtradas por ano.
     * @param {Object} la  Camada (layer) de exibição do mapa
     * @return {Text} Tabela em html com as informaçãos do município.
     *
     */
    function montaTabelaPopUpIdeb(aggregateDataByyear, la) {
        if (aggregateDataByyear == undefined || aggregateDataByyear == -1) {
            return "<b class='titleMunicipio'>" + la.feature.properties.Nome + "</b> <p align='center'>Sem Informações</p>";
        }

        return "<table style='font-size: 12.5px;' class='table table-responsive'> " +
            "<thead>" +
            "<tr>" +
            "<th colspan='2' class='titleMunicipio' align='center' scope='col'>Ano: " + aggregateDataByyear.ano + " -  Município: " + la.feature.properties.Nome + " </th>" +
            "</tr>" +
            "<tr>" +
            "<th scope='col'>IDEB</th>" +
            "<th scope='col'></th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<tr>" +
            "<td>Nota</td>" +
            "<td style='font-weight: bold; color:" + getColorFromMeta(aggregateDataByyear.atingiu_meta) + "' align='right'>" + converterFloatReal(aggregateDataByyear.indice) + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Meta</td>" +
            "<td align='right'>" + converterFloatReal(aggregateDataByyear.meta) + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Meta atingida?</td>" +
            "<td align='right'>" + getTextMeta(aggregateDataByyear.atingiu_meta) + "</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";

    }

    /**
     * @function poligonMap
     *
     * @description Esta função responsável por definir as áreas (polígonos) dos municípios do estado no mapa.
     *
     * @param {Object} map Objeto Leaflet.
     *
     */
    function poligonMap(map) {

        layer.addData(feature);


        layer.eachLayer(function(la) {

            let year = stepSlider.noUiSlider.get();
            let aggregateDataByyear = getYear(dadosIdeb[la.feature.properties.Nome], year);

            la.bindPopup(montaTabelaPopUpIdeb(aggregateDataByyear, la))
            setEventMouseOverOnLayer(la, map)
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
    function setLayer(map) {

        $(".titleAno").remove();
        $(".noUi-tooltip").prepend("<div class='titleAno'>Ano: </div>");

        layer.eachLayer(function(la) {

            let year = Math.floor(stepSlider.noUiSlider.get());
            let aggregateDataByyear = getYear(dadosIdeb[la.feature.properties.Nome], year);

            la.bindPopup(montaTabelaPopUpIdeb(aggregateDataByyear, la))
            setEventMouseOverOnLayer(la, map)
        });

        layer.setStyle(styleMap)
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
    function initMap(feature) {
        let mymap = L.map('mapid').setView([-16.361508, -49.500561], 6.40);
        mymap.createPane('labels');
        mymap.getPane('labels').style.zIndex = 800 /*650*/ ;
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoiam9zZXVtYmVydG9tb3JlaXJhIiwiYSI6ImNqbDJuMDkyYjFzZnMzcnF4NHhtcXZjc2MifQ.t7kEbLAbmqBoewQvM5HgDg', {
            attribution: 'CAO Educação e UTP Geoprocessamento - CATEP',
            maxZoom: 18,
            minZoom: 3,
            id: 'mapbox.light',
            accessToken: 'pk.eyJ1Ijoiam9zZXVtYmVydG9tb3JlaXJhIiwiYSI6ImNqbDJuMDkyYjFzZnMzcnF4NHhtcXZjc2MifQ.t7kEbLAbmqBoewQvM5HgDg'
        }).addTo(mymap);

        $(window).on("resize", function() {
            $("#mapid").height($(window).height() - 400);
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
     * busca-se os dados do IDEB e depois será realizado a ordenação deles.
     *
     */
    const promise = new Promise(function(resolve, reject) {
        const municipalities = $.get({
            url: "/geojson",
            dataType: "json",
            success: function(polygons) {}
        });

        const dadosideb = $.get({
            url: "/ideb",
            dataType: "json",
            success: function(dadosideb) {}
        });

        $.when(municipalities, dadosideb).done(function(polygons, dadosideb) {
            dadosIdeb = dadosideb[0]
            feature = polygons[0].features.filter(getFeature);
            feature.sort(function(a, b) {
                return (a.properties.Nome > b.properties.Nome) ? 1 : ((b.properties.Nome > a.properties.Nome) ? -1 : 0);
            });
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
        return mymap

    }).then(function(mymap) {
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
         * Este script monitora os eventos de seleção caixa de seleção Etapa Escolar, caso haja alguma mudança
         * será montada uma nova camada no mapa com as informações selecioandas.
         */
        let municipalitie = $("#municipality").val();
        $("#classe").change(function() {
            legend.remove(mymap);
            addLegend(mymap);
            setLayer(mymap);
            chartMaker();
        });

        /**
         * Este script monitora os eventos de seleção e focus do campo Busca por Município, caso seja digitado algum texto
         * será retornado os municípios de contenham o texo infomado.
         */
        $("#municipality").autocomplete({
            source: Object.keys(dadosIdeb),
            select: function(event, ui) {
                chartMaker()
            },
            focus: function(e, ui) {
                $(this).val(ui.item.label);
                return false;
            }
        })

        /**
         * Este script monitora os eventos de clique no botão Exibir Município Selecionado, caso haja algum clique nesse botão,
         * será será exibido o município seleciondo juntamente com suas informações.
         */
        let layerSelected;
        $("#zoomin").click(function() {
            let municipalitie = $("#municipality").val();
            layer.eachLayer(function(lay) {
                if (lay.feature.properties.Nome === municipalitie) {
                    layerSelected = lay.setStyle({
                        color: 'blue',
                        weight: 5,
                        opacity: 2,
                    });
                    mymap.fitBounds(lay.getBounds());
                    layerSelected.openPopup()
                }
            });

        })

        /**
         * Este script monitora os eventos de clique no botão Limpar Seleção, caso haja algum clique nesse botão,
         * será removida a seleção do município e a visão do mapa sera ampliada.
         */
        $("#zoomout").click(function() {
            let municipalitie = $("#municipality").val();
            mymap.setView([-16.361508, -49.500561], 6.40);
            layerSelected.setStyle({
                color: "#000000",
                weight: 4,
                opacity: 0.2
            });
            layerSelected.closePopup()
        })

        /**
         * Código para capturar o evento de click nas abas da tela e chama o método de criação do gráfico
         */
        $("#grafico-tab").on('click', function() {
            chartMaker()
        })

        /**
         * @function getMunicipioPorClasse
         *
         * @description Esta função responsável por filtar municipios por classe (Etapa Escolar)
         *
         * @param {Obejct} mun Objeto do municipio
         * @return {Boolean} true / false
         *
         */
        function getMunicipioPorClasse(mun) {
            var classe = $("#classe option:selected").val();
            return mun.classe == classe;
        }

        /**
         * Este script monitora os eventos de clique no botão Gerar Relatório PDF, caso haja algum clique nesse botão,
         * será acionado o programa que gerará o Relatório do IDEB em PDF.
         */
        $("#gerarPdf").click(function() {
            let municipalitie = $("#municipality").val();
            var classe = $("#classe option:selected").text();
            geraPDF(dadosIdeb[municipalitie].filter(getMunicipioPorClasse), municipalitie, classe);
        })
    });

});