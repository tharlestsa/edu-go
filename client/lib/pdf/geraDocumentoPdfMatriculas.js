/**
 * @module client/lib/pdf/geraDocumentoPdfMatriculas
 *
 * @description Relatório Matrículas da Educação Infantil em PDF.
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
 * @function  formataDadosParaTabela
 *
 * @description Função responsável por definir as colunas da tabela e ordenar os valores por ano de forma decrescente.
 *
 * @param  {array} dados Informações do município sobre o Matrículas da Educação Infantil
 * @return {array} res   Lista dados formatado conforme os requisitos do plugin jsPDF
 */
function formataDadosParaTabela(dados) {

    var columns = [
        { title: 'Ano', dataKey: "ano" },
        { title: 'Pop. Estim. de Crianças IMB - 0 a 3 anos', dataKey: "Pop_0_3" },
        { title: 'Pop. Estim. de Crianças IMB - 4 a 5 anos', dataKey: "Pop_4_5" },
        { title: 'Mat. Creches', dataKey: "Mat_Creche_Nun" },
        { title: 'Mat. Pré-escolas', dataKey: "Mat_Pre_Esc_Nun" },
        { title: 'Creches', dataKey: "Mat_Creche_Per" },
        { title: 'Pré-escolas', dataKey: "Mat_Pre_Esc_Per" }
    ];


    var data = [];

    dados.sort(function(a, b) {
        return a.ano < b.Ano ? -1 : a.Ano > b.Ano ? 1 : 0;
    });

    $.each(dados, function(index, value) {
        var item = {
            ano: value.Ano,
            Pop_0_3: value.Pop_0_3,
            Pop_4_5: value.Pop_4_5,
            Mat_Creche_Nun: value.Mat_Creche_Nun,
            Mat_Pre_Esc_Nun: value.Mat_Pre_Esc_Nun,
            Mat_Creche_Per: converterFloatReal(value.Mat_Creche_Per) + '%',
            Mat_Pre_Esc_Per: converterFloatReal(value.Mat_Pre_Esc_Per) + '%'
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
 * @param {array}  dados     Dados que irão compor a tabela 
 * @param {string} municipio Nome do município 
 *
 * @returns {PDF}
 */
function geraPDF(dados, municipio) {
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
        doc.setFontSize(12);
        doc.text(30, 98, 'Dados de Matrículas da Educação Infantil em Creches e Pré-escolas do Município de ');
        doc.text(30, 110, municipio);

    };

    /**
     * Nessa variável consta as informações do rodapé do PDF
     */
    var footer = function() {
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
            top: 120,
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
            Pop_0_3: { cellWidth: 110 },
            Pop_4_5: { cellWidth: 110 },
            Mat_Creche_Nun: { cellWidth: 56 },
            Mat_Pre_Esc_Nun: { cellWidth: 54 },
            Mat_Creche_Per: { cellWidth: 55 },
            Mat_Pre_Esc_Per: { cellWidth: 65 }
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
     * Este código captura a string da imagem guardada no input hidden na pagina de Matrículas da Educação Infantil e adiciona no arquivo do PDF.
     */
    doc.addImage($("#graficoMatriculas").val(), 'JPEG', 2, 130, 590, 380);

    // Este trecho de código verifica a quantidade de páginas do documento.
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalDePaginas);
    }

    doc.save("Matrículas - " + municipio + ".pdf");
}