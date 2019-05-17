/**
 * @module client/lib/matriculas
 *
 * @description Matrículas da Educação Infantil
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

$(document).ready(function() {

    Plotly.setPlotConfig({ locale: 'pt-BR' }) // Setando configuração de localidade para o Plugin Plotly (Gerador de gráficos).

    let feature;
    let mpData;
    let layer = L.geoJson();
    let legend;

    const variables = {
        'Creches': 'Mat_Creche_Per',
        'Pré-escolas': 'Mat_Pre_Esc_Per'
    }


    /**
     * @function getFeature
     *
     * @description Esta função é reponsável por capturar o objeto referente a área do município (feature)
     * do objeto geoJSON.
     *
     * @param {Object} feature Área do município
     * @return {Object} Área do município.
     *
     */
    function getFeature(feature) {
        return feature
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
                labels = [];

            if ($("#variable option:selected").text() === 'Creches') {
                div.innerHTML =
                    '<span style="font-weight: 600;">LEGENDA</span><br>' +
                    '<i style="background:#b30000";></i><span style="font-weight: 500;"> <  10%</span><br>' +
                    '<i style="background:#ff1a1a";></i><span style="font-weight: 500;">10-20%</span><br>' +
                    '<i style="background:#ff8080";></i><span style="font-weight: 500;">20-30%</span><br>' +
                    '<i style="background:#cca300";></i><span style="font-weight: 500;">30-40%</span><br>' +
                    '<i style="background:#ffff00";></i><span style="font-weight: 500;">40-50%</span><br>' +
                    '<i style="background:#29a329";></i><span style="font-weight: 500;"> &ge; 50%</span><br>'
            } else {
                div.innerHTML =
                    '<span style="font-weight: 600;">LEGENDA</span><br>' +
                    '<i style="background:#b30000";></i><span style="font-weight: 500;"> < 20%</span><br>' +
                    '<i style="background:#ff1a1a";></i><span style="font-weight: 500;">20-40%</span><br>' +
                    '<i style="background:#ff8080";></i><span style="font-weight: 500;">40-50%</span><br>' +
                    '<i style="background:#cca300";></i><span style="font-weight: 500;">50-60%</span><br>' +
                    '<i style="background:#ffff00";></i><span style="font-weight: 500;">60-80%</span><br>' +
                    '<i style="background:#29a329";></i><span style="font-weight: 500;">80-100%</span><br>' +
                    '<i style="background:#076d2b";></i><span style="font-weight: 500;"> > 100%</span><br>'
            }

            return div;
        };
        legend.addTo(map);
    }


    /**
     * @function sliderStepDynamics
     *
     * @description Esta função é responsável por capturar qualquer alteração na barra de anos localizado abaixo do mapa de Matrículas da Educação Infantil
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
     * @description Esta função é reponsável por filtrar as informações do município pelo ano informado na chamada do método.
     *
     * @param {Array} list Lista com os municípios do estado
     * @param {Number} year Ano selecionado
     * @return {Array} Lista de informações do município filtradas por ano.
     *
     */
    function getYear(list, year) {

        if (list === undefined)
            return -1
        for (let i = 0; i < list.length; i++) {
            if (list[i].Ano == year)
                return list[i]
        }
    }

    /**
     * @function getStyleFromTypeMatricula
     *
     * @description Esta função é reponsável por definir a cor da área (polígono) do município no mapa conforme o tipo de matrícula .
     *
     * @param  {Array}  aggregateDataByyear Lista de informações do município filtradas por ano.
     * @param  {Number} value 			    Valor do percentual selecionado.
     *
     * @return {Object}                     Objeto com Parâmetros para estilização das áres dos municípios.
     *
     */
    function getStyleFromTypeMatricula(aggregateDataByyear, value) {

        /**
         * Este teste é necessário pois as taxas e as tonalidades das cores mudam de acordo com
         * o tipo de matrícula foi selecionado.
         */
        if (value === 'Creches') {
            //Este trecho irá configuarar as cores e taxas das matrículas Creches
            if (aggregateDataByyear[variables[value]] >= 50) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#29a329"
                };
            } else if (aggregateDataByyear[variables[value]] >= 40 && aggregateDataByyear[variables[value]] < 50) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#ffff00"
                };
            } else if (aggregateDataByyear[variables[value]] >= 30 && aggregateDataByyear[variables[value]] < 40) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#cca300"
                };
            } else if (aggregateDataByyear[variables[value]] >= 20 && aggregateDataByyear[variables[value]] < 30) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#ff8080"
                };
            } else if (aggregateDataByyear[variables[value]] >= 10 && aggregateDataByyear[variables[value]] < 20) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#ff1a1a"
                };
            } else if (aggregateDataByyear[variables[value]] < 10) {
                return {
                    color: "#000000",
                    opacity: 0.4,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#b30000"
                };
            }
        } else {
            //Este trecho irá configuarar as cores e taxas das matrículas Pré-escolas
            if (aggregateDataByyear[variables[value]] > 100) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#076d2b"
                };
            } else if (aggregateDataByyear[variables[value]] >= 80 && aggregateDataByyear[variables[value]] < 100) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#29a329"
                };
            } else if (aggregateDataByyear[variables[value]] >= 60 && aggregateDataByyear[variables[value]] < 80) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#ffff00"
                };
            } else if (aggregateDataByyear[variables[value]] >= 50 && aggregateDataByyear[variables[value]] < 60) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#cca300"
                };
            } else if (aggregateDataByyear[variables[value]] >= 40 && aggregateDataByyear[variables[value]] < 50) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 2,
                    fillOpacity: 1.9,
                    fillColor: "#ff8080"
                };
            } else if (aggregateDataByyear[variables[value]] >= 20 && aggregateDataByyear[variables[value]] < 40) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 4,
                    fillOpacity: 1.9,
                    fillColor: "#ff1a1a"
                };
            } else if (aggregateDataByyear[variables[value]] < 20) {
                return {
                    color: "#000000",
                    opacity: 0.2,
                    weight: 4,
                    fillOpacity: 1.9,
                    fillColor: "#b30000"
                };
            }
        }
    }

    /**
     * @function styleMap
     *
     * @description Esta função define o estilo {cor, borda, opacidade e etc.} dos municípios apresentado no mapa.
     *
     * @param  {object} feat    Feature do município.
     *
     * @return {object}         Objeto com informações do estilo do município.
     *
     */
    function styleMap(feat) {
        let value = $("#variable option:selected").text()

        let year = stepSlider.noUiSlider.get();
        let aggregateDataByyear = getYear(mpData[feat.properties.Nome], year);

        if (aggregateDataByyear === -1) {
            return {
                color: "#0000FF",
                opacity: 0.2,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#dddddd"
            };
        }

        if (mpData[feat.properties.Nome] !== undefined) {
            return getStyleFromTypeMatricula(aggregateDataByyear, value);
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
        let years = [];
        for (let i = 0; i < list.length; i++) {
            years.push(list[i].Ano)
        }
        return years

    }

    /**
     * @function getCreche
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente ao percentual de matrículas em creches (Mat_Creche_Per).
     *
     * @param {Array} list Lista de informações do município.
     * @return {Number} Percentual de matrículas em creches.
     *
     */
    function getCreche(list) {
        let creche = [];
        for (let i = 0; i < list.length; i++) {
            creche.push(list[i].Mat_Creche_Per)
        }
        return creche
    }

    /**
     * @function getPreEscola
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente ao percentual de matrículas em pré-escolas (Mat_Pre_Esc_Per).
     *
     * @param {Array} list Lista de informações do município.
     * @return {Number} Percentual de matrículas em pré-escolas.
     *
     */
    function getPreEscola(list) {
        let preEscola = [];
        for (let i = 0; i < list.length; i++) {
            preEscola.push(list[i].Mat_Pre_Esc_Per)
        }
        return preEscola
    }


    /**
     * @function chartMaker
     *
     * @description Esta função é responsável por gerar o gráfico de Percentuais de matrículas Creches e Pré-escolas do município
     *
     */
    function chartMaker() {
        let municipalitie = $("#municipality").val();

        let years = getYearFromMun(mpData[municipalitie])
        let creche = getCreche(mpData[municipalitie])
        let preEscola = getPreEscola(mpData[municipalitie])

        var trace1 = {
            x: years,
            y: creche,
            hoverinfo: 'y',
            type: 'scatter',
            name: '% Creche',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var trace2 = {
            x: years,
            y: preEscola,
            hoverinfo: 'y',
            type: 'scatter',
            name: '% Pré-escola',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var layout = {
            title: "<b>Percentuais de matrículas Creches e Pré-escolas do município de " + municipalitie + "<b>",
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
         * do relatório de Matrículas da Educação Infantil.
         * Será criado um input do tipo hidden
         * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
         * @return    {Text} Imagem em base64
         */
        Plotly.toImage('myDiv', { format: 'jpeg', height: 500, width: 950 }).then(function(response) {
            response = JSON.stringify(response);
            $("#graficoMatriculas").remove();
            $("#myDiv").append("<input type='hidden' id='graficoMatriculas' name='graficoMatriculas' value=" + response + ">");
        });

    }

    /**
     * @function componentMaker
     *
     * @description Esta função é reponsável por montar a barra de anos abaixo do mapa conforme as informações existentes no
     * banco de dados.
     *
     * @param {Object} mymap Objeto Leaflet que cria o mapa.
     */
    function componentMaker(mymap) {
        let years = []
        let municipalitie = feature[0].properties.Nome;
        let filtredMpData = mpData[municipalitie];

        $("#municipality").val(municipalitie);

        let selectVariable = $('#variable');
        selectVariable.append($("<option/>").val(filtredMpData[0].Mat_Creche_Per).text("Creches"));
        selectVariable.append($("<option/>").val(filtredMpData[0].Mat_Pre_Esc_Per).text("Pré-escolas"));

        let count = 0;

        for (let i = 0; i < filtredMpData.length; i++) {
            years.push(filtredMpData[i].Ano)
            count++
        }

        let min = Math.min.apply(Math, years)
        let max = Math.max.apply(Math, years)

        noUiSlider.create(stepSlider, {
            range: {
                min: min,
                max: max
            },
            step: 1,
            format: {
                to: function(value) {
                    return value;
                },
                from: function(value) {
                    return value.replace(',-', '');
                }
            },
            tooltips: true,
            start: [min],
            connect: true,
            behaviour: 'tap-drag',
            pips: { mode: 'steps', stepped: true, density: 12, values: count }
        });

        sliderStepDynamics(mymap)
        poligonMap(mymap)

    }

    /**
     * @function getColorFromMatriculas
     *
     * @param {Number} percentual Percentual utilizado para definição das cores das features
     * @return {text} Cor em hexadecimal ou texto conforme o percentual de creches ou pré-escolas
     *
     */
    function getColorFromMatriculas(percentual) {
        let value = $("#variable option:selected").text();

        if (value === 'Creches') {
            //Este trecho irá configuarar as cores e taxas das matrículas Creches
            if (percentual >= 50) {
                return "#29a329";
            } else if (percentual >= 40 && percentual < 50) {
                return "#black";
            } else if (percentual >= 30 && percentual < 40) {
                return "#cca300";
            } else if (percentual >= 20 && percentual < 30) {
                return "#ff8080";
            } else if (percentual >= 10 && percentual < 20) {
                return "#ff1a1a";
            } else if (percentual < 10) {
                return "#b30000";
            }
        } else {
            if (percentual > 100) {
                return "#076d2b";
            } else if (percentual >= 80 && percentual < 100) {
                return "#29a329";
            } else if (percentual >= 60 && percentual < 80) {
                return "black";
            } else if (percentual >= 50 && percentual < 60) {
                return "#cca300";
            } else if (percentual >= 40 && percentual < 50) {
                return "#ff8080";
            } else if (percentual >= 20 && percentual < 40) {
                return "#ff1a1a";
            } else if (percentual < 20) {
                return "#b30000";
            }
        }
    }

    /**
     * @function getValorAbsolutoDeTiposDeMatricula
     *
     * @param {Array} aggregateDataByyear Lista de informações do município.
     * @return {Number} Valores absolutos
     *
     */
    function getValorAbsolutoDeTiposDeMatricula(aggregateDataByyear) {
        let value = $("#variable option:selected").text();

        if (value == 'Creches') {
            return aggregateDataByyear.Mat_Creche_Nun;
        } else {
            return aggregateDataByyear.Mat_Pre_Esc_Nun;
        }
    }

    function getValueFormatado(value) {
        numeral.register('locale', 'pt-BR', {
            delimiters: {
                thousands: '.',
                decimal: ','
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            currency: {
                symbol: 'R$'
            }
        });

        return numeral(value);
    }

    /**
     * @function montaTabelaPopUpIdeb
     *
     * @description Esta função responsável por montar a tabela de informações do município na janela acionada pelo PopUp.
     *
     * @param {array} aggregateDataByyear Lista de informações do município filtradas por ano.
     * @param {Object} la (layer) camada de exibição do mapa
     * @return {Text} Html com tabela em html com as informaçãos do município.
     *
     */
    function montaTabelaPopUpIdeb(aggregateDataByyear, la, year) {

        let value = $("#variable option:selected").text();

        year = parseInt(year);

        if (aggregateDataByyear == undefined || aggregateDataByyear == -1) {
            return "<b class='titleMunicipio'>" + la.feature.properties.Nome + "</b> <p align='center'>Sem Informações</p>";
        }

        return "<table style='font-size: 12px;' class='table table-responsive'> " +
            "<thead>" +
            "<tr>" +
            "<th colspan='2' class='titleMunicipio' align='center' scope='col'>Ano: " + year + " -  Município: " + la.feature.properties.Nome + " </th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<tr>" +
            "<td>Pop. Estim. de Crianças IMB - 0 a 3 anos</td>" +
            "<td align='right'>" + aggregateDataByyear.Pop_0_3 + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Pop. Estim. de Crianças IMB - 4 a 5 anos</td>" +
            "<td align='right'>" + aggregateDataByyear.Pop_4_5 + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Matrículas em " + value + "</td>" +
            "<td align='right'>" + getValorAbsolutoDeTiposDeMatricula(aggregateDataByyear) + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Taxa de Matrículas em " + value + "</td>" +
            "<td style='font-weight: bold; color:" + getColorFromMatriculas(aggregateDataByyear[variables[value]]) + "' align='right'>" + aggregateDataByyear[variables[value]].toFixed(2) + "%</td>" +
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
            let value = $("#variable option:selected").text()
            let aggregateDataByyear = getYear(mpData[la.feature.properties.Nome], year);
            la.bindPopup(montaTabelaPopUpIdeb(aggregateDataByyear, la, year))
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
            let value = $("#variable option:selected").text()
            let aggregateDataByyear = getYear(mpData[la.feature.properties.Nome], year);
            la.bindPopup(montaTabelaPopUpIdeb(aggregateDataByyear, la, year))
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
     * busca-se os dados de de matrículas da educação infantil em creches e ṕré-escolas e depois será realizado a ordenação deles.
     *
     */
    const promise = new Promise(function(resolve, reject) {
        const municipalities = $.get({
            url: "/geojson",
            dataType: "json",
            success: function(polygons) {}
        });

        const mpdata = $.get({
            url: "/mpdata",
            dataType: "json",
            success: function(mpdata) {}
        });

        $.when(municipalities, mpdata).done(function(polygons, mpdata) {
            mpData = mpdata[0]
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
         * Este script monitora os eventos de seleção caixa de seleção Percentuais de Matrículas em, caso haja alguma mudança
         * será montada uma nova camada no mapa com as informações selecionadas.
         */
        let municipalitie = $("#municipality").val();
        $("#variable").change(function() {
            legend.remove(mymap);
            addLegend(mymap);
            setLayer(mymap);
        });

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
         * Código para capturar o evento de click nas abas da tela e chama o método de criação do gráfico
         */
        $(".nav-item").on('click', function() {
            chartMaker()
        })

        /**
         * Este script monitora os eventos de seleção e focus do campo Busca por Município, caso seja digitado algum texto
         * será retornado os municípios de contenham o texo infomado.
         */
        $("#municipality").autocomplete({
            source: Object.keys(mpData),
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
         * Este script monitora os eventos de clique no botão Gerar Relatório PDF, caso haja algum clique nesse botão,
         * será acionado o programa que gerará o Relatório de Transporte Escolar em PDF.
         */
        $("#gerarPdf").click(function() {
            let municipalitie = $("#municipality").val();
            geraPDF(mpData[municipalitie], municipalitie);
        })

    });

});