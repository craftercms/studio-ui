<!-- this is a work-around for YUI opening an iframe to do an upload -->
<script>document.domain = "${cookieDomain}";</script>

{   "fileName": "${fileName}",
	"fileExtension": "${fileExtension}",
	"size":<#if size?exists>"${size?string("0.##")}${sizeUnit}"<#else>""</#if>
}