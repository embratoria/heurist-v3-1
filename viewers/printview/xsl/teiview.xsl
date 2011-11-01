<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:template match="/">
		<!-- use the following bit of code to include the stylesheet to display it in Heurist publishing wizard
			otherwise it will be ommited-->
		<!-- begin including code -->
		<xsl:comment>
			<!-- name (desc.) that will appear in dropdown list -->
			[name]TEI view[/name]
			<!-- match the name of the stylesheet-->
			[output]teiview[/output]
		</xsl:comment>
		<!-- end including code -->
<!--		<xsl:apply-templates select="/hml/records/record[@type=99]"/>



-->
		<script src="../js/annotationHighlight.js" type="text/javascript"/>

		<xsl:call-template name="setupRefs"></xsl:call-template>
		<div id="annotationList">
			<h2>Annotations</h2>
			<ul>
				
			</ul>
		</div>
		<div id="previews">
			<xsl:apply-templates select="/hml/records/record[type[@conceptID='3-25']]"/>
		</div>
		<xsl:apply-templates select="/hml/records/record[type[@conceptID='2-7']]"/>

		<xsl:call-template name="renderRefs"></xsl:call-template>
		
	</xsl:template>

	<xsl:template match="record[type[@conceptID='3-25']]">
		<div class="preview" style="display:none">
			<xsl:value-of select="detail[@conceptID='2-1']"/>
		</div>
		<xsl:call-template name="addRef">
			<xsl:with-param name="ref" select="."/>
			<xsl:with-param name="hide">false</xsl:with-param>
		</xsl:call-template>
	</xsl:template>


	<xsl:template name="setupRefs">
		<script type="text/javascript">
				delete window["refs"];
				window["refs"] = [];
		</script>
	</xsl:template>

	<xsl:template name="addRef">
		<xsl:param name="ref"/>
		<xsl:param name="hide"/>
		<script type="text/javascript">
			if (window["refs"]) {
				refs.push( {
					startElems : [ <xsl:value-of select="detail[@conceptID='3-539']"/> ],
					endElems : [ <xsl:value-of select="detail[@conceptID='3-539']"/> ],
					startWord :
						<xsl:choose>
							<xsl:when test="detail[@conceptID='3-329']"><xsl:value-of select="detail[@conceptID='3-329']"/></xsl:when>
							<xsl:otherwise>null</xsl:otherwise>
						</xsl:choose>,
					endWord :
						<xsl:choose>
							<xsl:when test="detail[@conceptID='3-330']"><xsl:value-of select="detail[@conceptID='3-330']"/></xsl:when>
							<xsl:otherwise>null</xsl:otherwise>
						</xsl:choose>,
					<xsl:if test="$hide='true'">
					hide : true,
					</xsl:if>
					<xsl:if test="detail[@conceptID='2-4']">
					target : <xsl:value-of select="detail[@conceptID='2-4']"/>,
					</xsl:if>
					title : "<xsl:call-template name="cleanQuote"><xsl:with-param name="string" select="detail[@conceptID='2-1']"/></xsl:call-template>",
					recordID : "<xsl:value-of select="id"/>",
					summary : "<xsl:value-of select="detail[@conceptID='2-12']"/>"
				} );
			}
		</script>
	</xsl:template>

	<xsl:template name="renderRefs">
		<script type="text/javascript">

		<![CDATA[
			window.setTimeout(function(){
			var root = document.getElementById("content");
			if (root  &&  window["refs"])
			highlight(root, refs);
			},50);
		]]>
		</script>
	</xsl:template>

	<!-- only use text/body/div from TEI, discard the rest -->
	<xsl:template match="record[type[@conceptID='2-7']]">
		<!-- this template looks for records with the concept of TEI document -->
		<div id="content">


<!--		<div><b><xsl:apply-templates select="reversePointer"/></b></div>-->

				<xsl:if test="self::node()[@type=99]">
					<xsl:value-of select="type"/>:
				</xsl:if>

			<xsl:apply-templates select="detail/file/content/text"/>
		</div>
	</xsl:template>

<!--		<xsl:template match="/hml/records/record[@type=99]">
				<b><xsl:value-of select="id"/></b>: <xsl:value-of select="title"/>
		</xsl:template>-->

	<xsl:template match="detail/file/content/text">

			<!-- do an identity transform - and then leave it like that -->

			<xsl:apply-templates/>


	</xsl:template>

	<xsl:template match="div1">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="div/head">
		<h2>
			<xsl:apply-templates/>
		</h2>
	</xsl:template>



	<xsl:template match="p">
		<p>
			<xsl:if test="@type">
				<xsl:attribute name="class">
					<xsl:value-of select="@type"/>
				</xsl:attribute>
			</xsl:if>
			<xsl:apply-templates/>
		</p>
	</xsl:template>


	<xsl:template match="hi">
		<span class="{@rend}">
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="quote">
		<span class="quote">
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="note">
		<span class="note">
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<!-- table -->
	<xsl:template match="table">
		<table cellpadding="2" cellspacing="2">
			<xsl:apply-templates/>
		</table>
	</xsl:template>
	<xsl:template match="table/row">
		<tr>
			<xsl:apply-templates/>
		</tr>
	</xsl:template>
	<xsl:template match="table/row/cell">
		<td class="teidoc">
			<xsl:apply-templates/>
		</td>
	</xsl:template>


	<!-- list -->
	<xsl:template match="list">
		<ul>
			<xsl:apply-templates/>
		</ul>
	</xsl:template>

	<xsl:template match="item">
		<li>
			<xsl:apply-templates/>
		</li>
	</xsl:template>

	<xsl:template match="lg">
		<p class="separator">
			<xsl:apply-templates/>
		</p>
	</xsl:template>

	<xsl:template match="l">
		<p class="poetry-line">
			<xsl:apply-templates/>
		</p>
	</xsl:template>




	<xsl:template name="cleanQuote">
		<xsl:param name="string" />
		<xsl:if test="contains($string, '&#x22;')"><xsl:value-of
			select="substring-before($string, '&#x22;')" />\"<xsl:call-template name="cleanQuote">
				<xsl:with-param name="string">
					<xsl:value-of select="substring-after($string, '&#x22;')" />
				</xsl:with-param>
			</xsl:call-template>
		</xsl:if>
		<xsl:if test="not(contains($string, '&#x22;'))"><xsl:value-of select="$string" /></xsl:if>
	</xsl:template>



</xsl:stylesheet>