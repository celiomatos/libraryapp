// salva ou edita autor
function saveAuthor(){

	var n = $('#edtnomeauthor').val();
	var s = $('#edtsobrenomeauthor').val();
	var i = $('#edtidauthor').val();

	dados = {firstName: n, lastName: s};

	if(i != "0"){
		dados = {firstName: n, lastName: s, id: i};
	} 

	$.ajax({ 
		type: 'PUT', 
		url: 'https://bibliapp.herokuapp.com/api/authors', 
		data: dados,
		dataType: 'json', 
		success: function(data) { 
			$('#edtidauthor').val(data.id);
			alert("Gravado com sucesso");
			getAuthors();
		}, 
		error: function(data) { 
			alert("Error na gravação");
		} 
	});
}

// verifica se existe livros cadastrados no autor
function delAutorAndBooks(autor){
	$.ajax({
		type: 'GET',
		url: "https://bibliapp.herokuapp.com/api/authors/"+autor+"/books/count",				
		success: function(data, status){
			if(data.count == "0"){
				delAuthor(autor);
			}else{
				alert("Autor possui livros cadastrados");
			}
		}
	});
}

// delete autor
function delAuthor(autor){
	$.ajax({
		type: 'DELETE',
		url: "https://bibliapp.herokuapp.com/api/authors/"+autor,				
		success: function(data, status){
			if(data.count == "1"){
				alert("Autor excluído com sucesso");
				getAuthors();
			}else{
				alert("Falha na exclusão do autor");
			}
		}
	});
}


// abrir o formulario de cadastro
function openModalAutor(i,f,l){
	// modal author
	var modal = document.getElementById('modalAutor');
	// botal close do modal
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function() {
		modal.style.display = "none";
	}

	$("#edtidauthor").val(i);
	$("#edtnomeauthor").val(f);
	$("#edtsobrenomeauthor").val(l);
	
	modal.style.display = "block";
}

var t=5; // tamanho da paginacao
var p=0; // pagina atual
var d; // dados coletados para paginacao
var tipo; // tipo de consulta
var tam=1; // tamanho da lista

// lista os autores
function getAuthors(){	
	p=0; // iniciando na paginacao 1
	$("#tautores > tbody > tr").remove();
	var autor = $("#idautor").val();
	
	if(autor != ""){
		$.getJSON("https://bibliapp.herokuapp.com/api/authors/"+autor, function(result){								
			d=result;
			tipo = 1;
			tam = 1;
			setTableAutores();
		});
	} else {
			//obtendo tipo de ordenacao para lista: nome ou sobrenome
			var f = "";			
			var c = $("input:checked").val();			
			
			if(c == "n"){
				f = "?filter=%7B%22order%22%3A%22firstName%22%7D";
			}else if(c == "s"){
				f= "?filter=%7B%22order%22%3A%22lastName%22%7D";
			}

			$.getJSON("https://bibliapp.herokuapp.com/api/authors"+f, function(result){				
					//alert(result.length);
					d=result;
					tipo = 2;
					tam = d.length;
					setTableAutores();					
			});
	}	
}

// alimentando table authores
function setTableAutores(){			
	habilitarBotoes();

	$("#tautores > tbody > tr").remove();	

	for (var i = p * t; i < tam && i < (p + 1) *  t; i++) {
		
		var id;
		var fn;
		var ln;

		if(tipo == 2){
			id = d[i].id;
			fn = d[i].firstName;
			ln = d[i].lastName;
		}else{
			id = d.id;
			fn = d.firstName;
			ln = d.lastName;
		} 
		$("tbody").append(
			"<tr><td>"+id+"</td>" + 
			"<td>"+fn+ "</td>" + 
			"<td>"+ln+"</td>" +
			"<td>"+"<a href=\"livros.html?livro="+id+"\" target=\"_blank\">Livros</a></td>"+
			"<td><button class=\"btn btn-info btn-sm\" onclick=\"openModalAutor("+id+",\'"+fn+"\',\'"+ln+"\')\">Editar</button>"+
			"&nbsp;<button class=\"btn btn-danger btn-sm\" onclick=\"delAutorAndBooks("+id+")\">Excluir</button></td></tr>");	
	}
	$('#numeracao').text('Página ' + (p + 1) + ' de ' + Math.ceil(tam / t));
}		

// habilitar botoes de paginacao
function habilitarBotoes() {
	$('#proximo').prop('disabled', tam <= t || p >= Math.ceil(tam / t) - 1);
	$('#anterior').prop('disabled', tam <= t || p == 0);
}

// acoes dos botas de paginacao
$(function() {
	$('#proximo').click(function() {
		if (p < tam / t - 1) {
			p++;
			setTableAutores();
			habilitarBotoes();
		}
	});
	$('#anterior').click(function() {
		if (p > 0) {
			p--;
			setTableAutores();
			habilitarBotoes();
		}
	});
	setTableAutores();
	habilitarBotoes();
});

// salva ou edita livro
function saveLivro(){

	var t = $('#edttitulolivro').val();
	var a = $('#idautorlivro').val();	

	$.ajax({ 
		type: 'POST', 
		url: 'https://bibliapp.herokuapp.com/api/books', 
		data: {title: t, authorId: a},
		dataType: 'json', 
		success: function(data) { 
			$('#edtidlivro').val(data.id);
			alert("Gravado com sucesso");
			getBooks();
		}, 
		error: function(data) { 
			alert("Error na gravação");
		} 
	});
}

// delete livro
function delLivro(livro){
	$.ajax({
		type: 'DELETE',
		url: "https://bibliapp.herokuapp.com/api/books/"+livro,				
		success: function(data, status){
			if(data.count == "1"){
				alert("Livro excluído com sucesso");
				getBooks();
			}else{
				alert("Falha na exclusão do livro");
			}
		}
	});
}

// alimenta table livros
function setTableLivros(result){
	$("tbody").append(
		"<tr><td>"+result.id + "</td>" + 
		"<td>"+result.title + "</td>"+
		"<td><button class=\"btn btn-danger btn-sm\" onclick=\"delLivro("+result.id+")\">Excluir</button></td></tr>");
}

// obtem lista de livros
function getBooks(){
	$("#tlivros tbody > tr").remove();
	var url   = window.location.search.replace("?", "");			
	var autor = url.split("?")[0].split("=")[1];
	$('#idautorlivro').val(autor);
	$.getJSON("https://bibliapp.herokuapp.com/api/authors/"+autor+"/books", function(result){				
		result.forEach(function(o, index){
			setTableLivros(o);
		});
	});
}

// abrir o formulario de cadastro de livro
function openModalLivro(i,t){
    // modal author
    var modal = document.getElementById('modalLivro');
	// botal close do modal
	var span = document.getElementsByClassName("close")[0];
	span.onclick = function() {
		modal.style.display = "none";
	}

	$("#edtidlivro").val(i);
	$("#edttitulolivro").val(t);			
	modal.style.display = "block";
}
