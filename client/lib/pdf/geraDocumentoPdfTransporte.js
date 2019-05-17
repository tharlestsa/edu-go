/**
 * @module client/lib/pdf/geraDocumentoPdfTransporte
 *
 * @description Relatório do Transporte Escolar em PDF
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

/**
 * @function  dataFormatada
 *
 * @description Função responsável por definir as colunas da tabela e ordenar os valores por ano de forma decrescente.
 *
 * @param  {d}       data  Data do sistema
 * @param  {boolean} horas Se essa parâmentro receber true, a função retornará a data com as horas
 *
 * @return {Date}    data  Data formatada no padrão brasileiro
 */

function dataFormatada(d, horas = false) {
    var data = new Date(d),
        dia = data.getDate(),
        mes = data.getMonth() + 1,
        ano = data.getFullYear(),
        hora = data.getHours(),
        minutos = data.getMinutes(),
        segundos = data.getSeconds();

    if (horas === true) {
        return [dia, mes, ano].join('/') + ' - ' + [hora, minutos, segundos].join(':');
    }
    return [dia, mes, ano].join('/');
}

var dataHorarioAtual = dataFormatada(jQuery.now(), true);
var data = dataFormatada(jQuery.now());

/**
 * @function  getTextoPP
 *
 * @param  {string} pp    Participação da promotoria
 * @return {string} texto
 */
function getTextoPP(pp) {
    var texto;
    if (pp == 'N') {
        texto = "Não participou";
    } else if (pp == 'S') {
        texto = "Participou";
    } else if (pp == 'NA') {
        texto = " Município não informou";
    }
    return texto;
}
/**
 * @function  getPercentuaFormatado
 *
 * @param  {value} percentual
 *
 * @return {number} percentual formatado
 */
function getPercentuaFormatado(value) {
    return $.number(value, 2);
}

/**
 * @function  formataDadosParaTabela
 *
 * @description Função responsável por definir as colunas da tabela e ordenar os valores por ano de forma decrescente.
 *
 * @param  {array} dados Informações do município sobre o Transporte Escolar
 * @return {array} res   Lista de dados formatados conforme os requisitos do plugin jsPDF
 */
function formataDadosParaTabela(dados) {

    var columns = [
        { title: 'Ano', dataKey: "ano" },
        { title: 'Participação da Promotoria', dataKey: "pp" },
        { title: 'Aprovado', dataKey: "aprov" },
        { title: 'Reprovado', dataKey: "reprov" },
        { title: 'Não Vistoriados', dataKey: "nao_comp" },
        { title: 'Total', dataKey: "total" },
        { title: 'Taxa de Veículos Aprovados', dataKey: "p_aprov" },
        { title: 'Taxa de Veículos Reprovados', dataKey: "p_reprov" },
        { title: 'Taxa de Veículos Não Vistoriados', dataKey: "p_naocomp" }
    ];


    var data = [];

    dados.sort(function(a, b) {
        return a.ano < b.ano ? -1 : a.ano > b.ano ? 1 : 0;
    });


    $.each(dados, function(index, value) {
        var item = {
            ano: value.ano,
            pp: getTextoPP(value.pp),
            aprov: value.aprov,
            reprov: value.reprov,
            nao_comp: value.nao_comp,
            total: value.total,
            p_aprov: (value.p_aprov < 0 ? '-' : getPercentuaFormatado(value.p_aprov) + '%'),
            p_reprov: (value.p_aprov < 0 ? '-' : getPercentuaFormatado(value.p_reprov) + '%'),
            p_naocomp: (value.p_aprov < 0 ? '-' : getPercentuaFormatado(value.p_naocomp) + '%')
        };

        data.push(item);
    });

    var res = { "columns": columns, "dados": data };

    return res;
}

/**
 * @function geraPDF
 *
 * @description Esta função gera o PDF transformado os dados da tabela em html para tabela JSON
 *
 * @param {array} dados { dados que irão compor a tabela }
 * @param {string} municipio { nome do município }
 *
 * @returns {PDF}
 */
function geraPDF(dados, municipio, semestre) {
    /**
     * Instância do objeto da classe geradora do PDF
     * @param {string} orientação:'p'(Portrait) / 'l'(Ladscape)
     * @param {string} idioma  'pt'
     * @type jsPDF
     */
    var doc = new jsPDF('l', 'pt');

    var totalDePaginas = "{total_pages_count_string}";

    /**
     * A função autoTableHtmlToJson transforma uma tabela html em tabela no formato JSON
     * @returns {JSON}
     */
    var res = formataDadosParaTabela(dados);

    /**
     * Esse é o cabeçalho do PDF.
     * OBS: as imgens que serão usadas no PDF deverão ser convertidas para base64
     * @param {type} data
     * @returns {header}
     */
    var header = function() {
        doc.setFontType('bold');
        doc.text(16, 80, '_________________________________________________________________________________________________________________________');
        doc.setFontSize(12);
        doc.text(45, 110, 'Dados do Transporte Escolar do Município de ' + municipio);
        doc.text(45, 125, 'do ' + semestre + ' Semestre');
    };

    /**
     * Nessa variável consta as informações do rodapé do PDF
     * @param {type} data
     */
    var footer = function() {
        var paginas = "Página " + doc.internal.getNumberOfPages();
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + " de " + totalDePaginas;
        }
        doc.setFontSize(9);

        doc.setFontType('normal');
        doc.text(paginas, dadosDaPagina.settings.margin.left + 390, doc.internal.pageSize.height - 10);
        doc.text(dataHorarioAtual, dadosDaPagina.settings.margin.left + 700, doc.internal.pageSize.height - 10);
    };

    doc.setFontSize(8);

    var options = {

        margin: {
            top: 140
        },

        didDrawPage: function(data) {
            dadosDaPagina = data;
            // Header
            header();
            // Footer
            footer();

        },

        columnStyles: {
            ano: { cellWidth: 30 },
            pp: { cellWidth: 80 },
            aprov: { cellWidth: 80 },
            reprov: { cellWidth: 80 },
            total: { cellWidth: 50 },
            p_aprov: { cellWidth: 80 },
            p_reprov: { cellWidth: 80 },
            p_naocomp: { cellWidth: 80 }
        },

        //'everyPage' = mostra o cabeçalho a cada página
        //'firstPage' = mostra o cabeçalho apenas na primeira página
        //'never'     = nunca mostra o cabeçalho
        showHead: 'everyPage',
        theme: 'striped', // 'striped', 'grid' or 'plain'
        startY: false //doc.autoTableEndPosY() + 60
    };

    doc.autoTable(res.columns, res.dados, options);


    doc.addPage();

    header();
    footer();
    /**
     * Este código captura a string da imagem guardada no input hidden na pagina de Transporte Escolar e adiciona no arquivo do PDF.
     */
    doc.addImage($("#graficoTransporte").val(), 'JPEG', 8, 130, 780, 400);

    // Este trecho de código verifica a quantidade de páginas do documento.
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalDePaginas);
    }

    doc.save("Transporte Escolar - " + municipio + " - " + semestre + " Semestre.pdf");
}