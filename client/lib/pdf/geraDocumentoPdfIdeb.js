/**
 * @module client/lib/pdf/geraDocumentoPdfIdeb
 *
 * @description Relatório do IDEB em PDF.
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
 * @param  {boolean} horas Se passar true, a função retornará a data com as horas
 * @return {Date}          Data formatada no padrão brasileiro]
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
 * @function  formataDadosParaTabela
 *
 * @description Função responsável por definir as colunas da tabela e ordenar os valores por ano de forma decrescente.
 *
 * @param  {array} dados Informações do município sobre o IDEB
 * @return {array}       Lista de dados formatados conforme os requisitos do plugin jsPDF
 */
function formataDadosParaTabela(dados) {

    var columns = [
        { title: 'Ano', dataKey: "ano" },
        { title: 'IDEB', dataKey: "ideb" },
        { title: 'Meta', dataKey: "meta" },
        { title: 'Meta atingida?', dataKey: "atingiu_meta" }
    ];


    var data = [];

    dados.sort(function(a, b) {
        return a.ano < b.ano ? -1 : a.ano > b.ano ? 1 : 0;
    });

    $.each(dados, function(index, value) {
        var item = {
            ano: value.ano,
            ideb: converterFloatReal(value.indice),
            meta: converterFloatReal(value.meta),
            atingiu_meta: (value.atingiu_meta == 1 ? "Sim" : "Não")
        };

        data.push(item);
    });

    var res = { "columns": columns, "dados": data };

    return res;
}

/**
 * @function  geraPDF
 *
 * @description Esta função gera o PDF transformado os dados da tabela em html para tabela JSON
 *
 * @param {array}  dados     Dados que irão compor a tabela
 * @param {string} municipio Nome do município
 * @param {string} etapa     Etapa escolar
 *
 * @returns {PDF}
 */
function geraPDF(dados, municipio, etapa) {
    /**
     * Instância do objeto da classe geradora do PDF
     * @param {string} orientação:'p'(Portrait) / 'l'(Ladscape)
     * @param {string} idioma  'pt'
     * @type jsPDF
     */
    var doc = new jsPDF('p', 'pt');

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
        doc.text(16, 80, '____________________________________________________________________________________');
        doc.setFontSize(13);
        doc.text(45, 100, 'Dados do IDEB do Município de ' + municipio);
        doc.text(45, 115, 'Correspondente aos ' + etapa);

    };

    /**
     * Nessa variável consta as informações do rodapé do PDF
     * @param {type} data
     */
    var footer = function() {
        // console.log(JSON.stringify(dadosDaPagina));
        var paginas = "Página " + doc.internal.getNumberOfPages();
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + " de " + totalDePaginas;
        }

        doc.setFontSize(9);
        doc.setFontType('normal');
        doc.setFontType('normal');
        doc.text(paginas, 280, doc.internal.pageSize.height - 10);
        doc.text(dataHorarioAtual, 495, doc.internal.pageSize.height - 10);
    };

    doc.setFontSize(8);

    var options = {

        margin: {
            top: 150,
            left: 150,
            right: 150
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
            ideb: { cellWidth: 30 },
            meta: { cellWidth: 30 },
            atingiu_meta: { cellWidth: 10 }
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
     * Este código captura a string da imagem guardada no input hidden na pagina do IDEB e adiciona no arquivo do PDF.
     */
    doc.addImage($("#graficoIdeb").val(), 'JPEG', 2, 130, 590, 380);

    // Este trecho de código verifica a quantidade de páginas do documento.
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalDePaginas);
    }

    doc.save("Ideb - " + municipio + " - " + etapa + ".pdf");
}