/**
 * @module client/lib/transporte
 *
 * @description Transporte Escolar
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

$(document).ready(function() {

    Plotly.setPlotConfig({ locale: 'pt-BR' }) // Setando configuração de localidade para o Plugin Plotly (Gerador de gráficos).

    let feature;
    let dadosTransporte;
    let layer = L.geoJson();
    let legend;

    const variables = {
        'p_aprov': 'p_aprov'
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
            div.innerHTML = '<span style="font-weight: 600;">LEGENDA</span><br>' +
                '<i style="background:#0033cc";></i><span style="font-weight: 500;">Não informou</span><br>' +
                '<i style="background:#b30000";></i><span style="font-weight: 500;">00,00% - 22,00%</span><br>' +
                '<i style="background:#ff8c1a";></i><span style="font-weight: 500;">22,00% - 53,00%</span><br>' +
                '<i style="background:#ffff00";></i><span style="font-weight: 500;">53,00% - 76,00%</span><br>' +
                '<i style="background:#29a329";></i><span style="font-weight: 500;">76,00% - 92,00%</span><br>' +
                '<i style="background:#076d2b";></i><span style="font-weight: 500;">92,00% - 100,00%</span><br>';

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
     * @description Esta função é reponsável por filtrar as informações do município pelo ano e semestre selecionado.
     *
     * @param  {Array}  list   Lista com os municípios do estado
     * @param  {Number} year   Ano selecionado
     *
     * @return {Array} Lista de informações do município filtradas por ano e semestre.
     *
     */
    function getYear(list, year) {
        var semestre = $("#semestre option:selected").val();
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
                if (list[i].ano == year && semestre == list[i].semestre) {
                    return list[i];
                }
            }
        }

    }

    /**
     * @function getStylePercentualAprovado
     *
     * @description Esta função é reponsável por definir a cor da área (polígono) do município no
     * mapa conforme o percentual aprovado.
     *
     * @param {Array} aggregateDataByyear Lista de informações do município filtradas por ano.
     *
     * @return {Object} Objeto com parâmetros para estilização das áres dos municípios.
     *
     */
    function getStylePercentualAprovado(aggregateDataByyear) {
        let value = aggregateDataByyear[variables['p_aprov']];

        // value = $.number( value, 2 );
        //Este trecho irá configuarar as cores e taxas de percetuais de aprovação
        if (value == -1) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#0033cc"
            };
        } else if (value >= 92.00 && value <= 100.0) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#076d2b"
            };
        } else if (value >= 76.00 && value < 92.00) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#29a329"
            };
        } else if (value >= 53.00 && value < 76.00) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#ffff00"
            };
        } else if (value >= 22.00 && value < 53.00) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#ff8c1a"
            };
        } else if (value < 22.00) {
            return {
                color: "#000000",
                opacity: 0.4,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#b30000"
            };
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
        let year = stepSlider.noUiSlider.get();
        let aggregateDataByyear = getYear(dadosTransporte[feat.properties.Nome], year);

        if (aggregateDataByyear == undefined) {
            return {
                color: "#0000FF",
                opacity: 0.2,
                weight: 2,
                fillOpacity: 1.9,
                fillColor: "#0033cc"
            };
        }

        if (dadosTransporte[feat.properties.Nome] !== undefined) {
            return getStylePercentualAprovado(aggregateDataByyear);
        }
    }


    /**
     * @function getYearsFromMun
     *
     * @description Esta função responsável por filtrar da lista de informações classificadas por ano,
     * os anos de um determinado município.
     *
     * @param  {Array} list Lista de informações do município.
     *
     * @return {Array}      Lista anos do município.
     *
     */
    function getYearFromMun(list) {
        var semestre = $("#semestre option:selected").val();
        let years = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].semestre == semestre) {
                years.push(list[i].ano)
            }
        }
        return years

    }

    /**
     * @function getPercentualAprovado
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente ao percentual aprovado (p_aprov).
     *
     * @param  {Array} list Lista de informações do município.
     *
     * @return {Number}     Percentual aprovado.
     *
     */
    function getPercentualAprovado(list) {
        var semestre = $("#semestre option:selected").val();
        let perAprovado = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].semestre == semestre) {
                perAprovado.push(list[i].p_aprov)
            }

        }
        return perAprovado
    }

    /**
     * @function getPercentualReprovado
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente ao percentual reprovado (p_reprov).
     *
     * @param  {Array} list Lista de informações do município.
     *
     * @return {Number}     Percentual reprovado.
     *
     */
    function getPercentualReprovado(list) {
        var semestre = $("#semestre option:selected").val();
        let perReprovado = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].semestre == semestre) {
                perReprovado.push(list[i].p_reprov)
            }
        }
        return perReprovado
    }

    /**
     * @function getPercentualNaoCompareceu
     *
     * @description Esta função responsável por filtrar da lista de informações do município,
     * o valor correspondente ao percentual de veículos que não compareceram a vistoria (p_naocomp).
     *
     * @param  {Array} list Lista de informações do município.
     *
     * @return {Number}     Percentual de veículos que não compareceram a vistoria.
     *
     */
    function getPercentualNaoCompareceu(list) {
        var semestre = $("#semestre option:selected").val();
        let perNaoComp = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].semestre == semestre) {
                perNaoComp.push(list[i].p_naocomp)
            }
        }
        return perNaoComp
    }

    /**
     * @function chartMaker
     *
     * @description Esta função é responsável por gerar o gráfico de  Vistoria do transporte escolar dos municípios
     *
     */
    function chartMaker() {
        let municipalitie = $("#municipality").val();

        let years = getYearFromMun(dadosTransporte[municipalitie])
        let perAprovado = getPercentualAprovado(dadosTransporte[municipalitie])
        let perReprovado = getPercentualReprovado(dadosTransporte[municipalitie])
        let perNaoComp = getPercentualNaoCompareceu(dadosTransporte[municipalitie])

        var trace1 = {
            x: years,
            y: perAprovado,
            hoverinfo: 'y',
            type: 'scatter',
            name: '% Aprovados',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var trace2 = {
            x: years,
            y: perReprovado,
            hoverinfo: 'y',
            type: 'scatter',
            name: '% Reprovados',
            marker: {
                line: {
                    width: 10
                }
            }
        };
        var trace3 = {
            x: years,
            y: perNaoComp,
            hoverinfo: 'y',
            type: 'scatter',
            hoverinfo: 'y',
            name: '% Não Compareceu',
            marker: {
                line: {
                    width: 10
                }
            }
        };

        var layout = {
            title: "<b> Vistoria do transporte escolar do município de " + municipalitie + " <b>",
            showlegend: true,
            xaxis: {
                title: "",
                nticks: 3,
                tickformat: 'Y',
                hoverformat: 'Y'
            },
            titlefont: {
                size: 16,
                family: 'Open Sans, verdana, arial, sans-serif'
            }
        };

        var data = [trace1, trace2, trace3];

        Plotly.newPlot('myDiv', data, layout, { locale: 'pt-BR', responsive: true });

        /**
         * @function toImage
         * @description O trecho de código a seguir, criar a imagem do gráfico para ser utilizado pelo programa gerador de PDF
         * do relatório do Transporte Escolar.
         * Será criado um input do tipo hidden
         * para guardar essa string e posteriormente ser capturada pelo gerador de PDF.
         * @return     {Text} Imagem em base64
         */
        Plotly.toImage('myDiv', { format: 'jpeg', height: 450, width: 1000 }).then(function(response) {
            response = JSON.stringify(response);
            $("#graficoTransporte").remove();
            $("#myDiv").append("<input type='hidden' id='graficoTransporte' name='graficoTransporte' value=" + response + ">");
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
        let filterdadosTransporte = dadosTransporte[municipalitie];

        $("#municipality").val(municipalitie);

        let count = 0;

        for (let i = 0; i < filterdadosTransporte.length; i++) {
            years.push(filterdadosTransporte[i].ano)
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
            step: 1,
            start: [min],
            connect: true,
            behaviour: 'tap-drag',
            pips: { mode: 'steps', stepped: true, density: 12, values: count }
        });
        sliderStepDynamics(mymap)
        poligonMap(mymap)

    }

    /**
     * @function getColorFromPercentualAprovado
     *
     * @param {Number} percentual Percentual Aprovado
     * @return {Text} Cor conforme o percentual aprovado
     *
     */
    function getColorFromPercentualAprovado(percentual) {

        var value = $.number(percentual, 2);

        if (value == -1) {
            return "#0033cc";
        } else if (value >= 92.00 && value <= 100.0) {
            return "#076d2b";
        } else if (value >= 76.00 && value < 92.00) {
            return "#29a329";
        } else if (value >= 53.00 && value < 76.00) {
            return "black";
        } else if (value >= 22.00 && value < 53.00) {
            return "#ff8c1a";
        } else if (value < 22.00) {
            return "#b30000";
        }

    }

    /**
     * @function montaTabelaPopUpIdeb
     *
     * @description Esta função responsável por montar a tabela de informações do município na janela acionada pelo PopUp.
     *
     * @param  {Array}  aggregateDataByyear Lista de informações do município filtradas por ano.
     * @param  {Object} la                  Camada(layer) de exibição do mapa
     * @return {Text}                       Tabela em html com as informaçãos do município.
     *
     */
    function montaTabelaPopUpIdeb(aggregateDataByyear, la) {
        if (aggregateDataByyear == undefined || aggregateDataByyear == -1) {
            return "<b class='titleMunicipio'>" + la.feature.properties.Nome + "</b> <p  align='center'>Sem informações</p>";
        } else if (aggregateDataByyear.p_aprov == -1) {
            return "<b class='titleMunicipio'>" + la.feature.properties.Nome + "</b> <p align='center'>O município não informou dados</p>";
        }

        return "<table style='font-size: 12px;' class='table table-responsive'> " +
            "<thead>" +
            "<tr>" +
            "<th colspan='2' class='titleMunicipio' align='center' scope='col'>Ano: " + aggregateDataByyear.ano + " -  Município: " + la.feature.properties.Nome + " </th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<tr>" +
            "<td>Veículos Aprovados</td>" +
            "<td align='right'>" + aggregateDataByyear.aprov + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Veículos Reprovados</td>" +
            "<td align='right'>" + aggregateDataByyear.reprov + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Veículos não vistoriados</td>" +
            "<td align='right'>" + aggregateDataByyear.nao_comp + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Total de Veículos</td>" +
            "<td align='right'>" + aggregateDataByyear.total + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Percentual de Veículos Aprovados</td>" +
            "<td style='font-weight: bold; color:" + getColorFromPercentualAprovado(aggregateDataByyear.p_aprov) + "' align='right'>" + getPercentuaFormatado(aggregateDataByyear.p_aprov) + "%</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Percentual de Veículos Reprovados</td>" +
            "<td align='right'>" + getPercentuaFormatado(aggregateDataByyear.p_reprov) + "%</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Percentual de Veículos Não vistoriados</td>" +
            "<td align='right'>" + getPercentuaFormatado(aggregateDataByyear.p_naocomp) + "%</td>" +
            "</tr>" +
            "<tr>" +
            "<td>Participação da Promotoria</td>" +
            "<td align='right'>" + getTextoPP(aggregateDataByyear.pp) + "</td>" +
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
            let aggregateDataByyear = getYear(dadosTransporte[la.feature.properties.Nome], year);

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
            let aggregateDataByyear = getYear(dadosTransporte[la.feature.properties.Nome], year);

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
     * busca-se os dados do Transporte Escolar e depois será realizado a ordenação deles.
     *
     */
    const promise = new Promise(function(resolve, reject) {

        const municipalities = $.get({
            url: "/geojson",
            dataType: "json",
            success: function(polygons) {}
        });

        const dadostransporte = $.get({
            url: "/transporte",
            dataType: "json",
            success: function(dadostransporte) {}
        });

        $.when(municipalities, dadostransporte).done(function(polygons, dadostransporte) {
            dadosTransporte = dadostransporte[0]
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
         * Este script monitora os eventos de seleção caixa de seleção Semestre, caso haja alguma mudança
         * será montada uma nova camada no mapa com as informações selecionadas.
         */
        let municipalitie = $("#municipality").val();
        $("#semestre").change(function() {
            legend.remove(mymap);
            addLegend(mymap);
            setLayer(mymap);
            chartMaker();
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
            source: Object.keys(dadosTransporte),
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
         * @function getMunicipioPorSemestre
         *
         * @description Esta função responsável por filtar municipios por semestre
         *
         * @param  {Object}  mun Municipio
         *
         * @return {Boolean}     (true / false)
         *
         */
        function getMunicipioPorSemestre(mun) {
            var semestre = $("#semestre option:selected").val();
            return mun.semestre == semestre;
        }

        $("#gerarPdf").click(function() {
            let municipalitie = $("#municipality").val();
            var semestre = $("#semestre option:selected").text();
            geraPDF(dadosTransporte[municipalitie].filter(getMunicipioPorSemestre), municipalitie, semestre);
        })
    });

});