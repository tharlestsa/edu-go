/**
 * @module client/lib/pdf/geraDocumentoPdfFinanciamento
 *
 * @description Relatório do Financimento da Educação em PDF
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
 * @param  {Date}    data  Data do sistema
 * @param  {boolean} horas Se passar true, a função retornará a data com as horas
 * @return {Date}          [data formatada no padrão brasileiro]
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
 * @param  {array} dados Informações do município sobre o Financimento da Educação
 * @return {array}       Lista de dados formatados conforme os requisitos do plugin jsPDF
 */
function formataDadosParaTabela(dados) {

    var columns = [
        { title: 'Ano', dataKey: "ano" },
        { title: '* Receitas MDE', dataKey: "mde" },
        { title: 'Receitas FUNDEB', dataKey: "fundeb" },
        { title: 'Despesas MDE Educação Infantil', dataKey: "mde_edu_inf" },
        { title: 'Despesas MDE Educação Fundamental', dataKey: "mde_edu_fun" },
        { title: 'Despesas FUNDEB Pag. Magistério', dataKey: "fundeb_pag_mag" },
        { title: 'Despesas FUNDEB Outras Despesas', dataKey: "fundeb_out_dep" },
        { title: 'Dedução Constitucional', dataKey: "dedu_const" },
        { title: 'Percentual Certificado', dataKey: "perc_cert" }
    ];


    var data = [];
    /**
     * Este código ordena os anos do municipio de forma decrescente.
     */
    dados.sort(function(a, b) {
        return a.ano < b.ano ? -1 : a.ano > b.ano ? 1 : 0;
    });

    $.each(dados, function(index, value) {
        var item = {
            ano: value.ano,
            mde: converterFloatReal(value.item1_mde),
            fundeb: converterFloatReal(value.item1_fundeb),
            mde_edu_inf: converterFloatReal(value.itens3e4_mde_edu_inf),
            mde_edu_fun: converterFloatReal(value.itens3e4_mde_edu_fun),
            fundeb_pag_mag: converterFloatReal(value.itens3e4_fundeb_pag_mag),
            fundeb_out_dep: converterFloatReal(value.itens3e4_fundeb_outras_desp),
            dedu_const: converterFloatReal(value.dedu_const),
            perc_cert: converterFloatReal(value.item2_perc_cert) + "%"
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
     *
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
        doc.text(45, 110, 'Dados do Financiamento da Educação do Município de ' + municipio);

    };

    /**
     * Nessa variável consta as informações do rodapé do PDF
     */
    var footer = function() {
        // console.log(JSON.stringify(dadosDaPagina));
        var paginas = "Página " + doc.internal.getNumberOfPages();
        // Total page number plugin only available in jspdf v1.0+
        if (typeof doc.putTotalPages === 'function') {
            paginas = paginas + " de " + totalDePaginas;
        }
        var note = '* Impostos e transferências constitucionais';

        doc.setFontType('normal');
        doc.setFontSize(8);
        doc.text(note, dadosDaPagina.settings.margin.left + 0, doc.internal.pageSize.height - 70);
        doc.setFontSize(9);
        doc.setFontType('normal');
        doc.text(paginas, dadosDaPagina.settings.margin.left + 390, doc.internal.pageSize.height - 10);
        doc.text(dataHorarioAtual, dadosDaPagina.settings.margin.left + 700, doc.internal.pageSize.height - 10);
    };

    doc.setFontSize(8);

    var options = {

        margin: {
            top: 130
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
            mde: { cellWidth: 88 },
            fundeb: { cellWidth: 95 },
            mde_edu_inf: { cellWidth: 95 },
            mde_edu_fun: { cellWidth: 95 },
            fundeb_pag_mag: { cellWidth: 95 },
            fundeb_out_dep: { cellWidth: 95 },
            dedu_const: { cellWidth: 95 },
            perc_cert: { cellWidth: 65 }
        },
        //'everyPage' = mostra o cabeçalho a cada página
        //'firstPage' = mostra o cabeçalho apenas na primeira página
        //'never'     = nunca mostra o cabeçalho
        showHead: 'everyPage',
        theme: 'striped', // 'striped', 'grid' or 'plain'
        startY: false //doc.autoTableEndPosY() + 60
    };

    doc.autoTable(res.columns, res.dados, options);

    doc.addImage($("#graficoReceitas").val(), 'JPEG', 200, 220, 400, 310);

    doc.addPage();

    header();
    footer();

    /**
     * Este código captura a string da imagem guardada no input hidden na pagina de Financiamento da Educação e adiciona no arquivo do PDF.
     */
    doc.addImage($("#graficoDespesas").val(), 'JPEG', 25, 120, 400, 380);
    doc.addImage($("#graficoOutrasInfo").val(), 'JPEG', 430, 120, 400, 380);

    // Este trecho de código verifica a quantidade de páginas do documento.
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalDePaginas);
    }

    doc.save("Financiamento da Educação - " + municipio + ".pdf");
}