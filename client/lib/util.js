/**
 * @module client/lib/util
 *
 * @description Funções globais
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

/**
 * @function converterFloatReal
 *
 * @param  {number} valor Valor no formato americano
 * @return {number} valor valor no formato brasileiro
 */
function converterFloatReal(valor) {
    var inteiro = null,
        decimal = null,
        c = null,
        j = null;
    var aux = new Array();
    valor = "" + valor;
    c = valor.indexOf(".", 0);
    //encontrou o ponto na string
    if (c > 0) {
        //separa as partes em inteiro e decimal
        inteiro = valor.substring(0, c);
        decimal = valor.substring(c + 1, valor.length);
    } else {
        inteiro = valor;
    }

    //pega a parte inteiro de 3 em 3 partes
    for (j = inteiro.length, c = 0; j > 0; j -= 3, c++) {
        aux[c] = inteiro.substring(j - 3, j);
    }

    //percorre a string acrescentando os pontos
    inteiro = "";
    for (c = aux.length - 1; c >= 0; c--) {
        inteiro += aux[c] + '.';
    }
    inteiro = inteiro.replace("-.", "-");
    //retirando o ultimo ponto e finalizando a parte inteiro

    inteiro = inteiro.substring(0, inteiro.length - 1);

    decimal = parseInt(decimal);
    if (isNaN(decimal)) {
        decimal = "00";
    } else {
        decimal = "" + decimal;
        if (decimal.length === 1) {
            decimal = "0" + decimal;
        }
    }
    valor = inteiro + "," + decimal;

    return valor;
}

/**
 * @function setEventMouseOverOnLayer
 *
 * @description Função responsável por habilitar o evento que monitora
 * quando o cursor do mouse paira sobre algum município,
 * acionando o PopUp com as informações do município que está sobre.
 *
 * @param {object} layer Camada de exibição do mapa
 * @param {object} map   objeto do mapa
 */
function setEventMouseOverOnLayer(layer, map) {
    /**
     * Função responsável por habilitar a exibição dos dados do município ao passar o mouse sobre a área dele.
     */
    layer.on('mouseover', function(e) {
        e.target.closePopup();
        var popup = e.target.getPopup();
        popup.setLatLng(e.latlng).openOn(map);
    });

    layer.on('mouseout', function(e) {
        e.target.closePopup();
    });

    layer.on('mousemove', function(e) {
        e.target.closePopup();
        var popup = e.target.getPopup();
        popup.setLatLng(e.latlng).openOn(map);
    });
}