#scriptLoad#

这是一个为了实现利用javascript载入其他javascript的项目

##引入##

在head里添加
<script type="text/javascript" src="scriptLoad.js"></script>既可以开始使用

#方法&参数#
<ul>
  <li>scriptLoad.addTask(<i>scriptType</i>,<i>scriptSrc</i>,<i>options</i>)</li>
  <li>scriptLoad.run(<i>options</i>)</li>
</ul>
###scriptLoad.addTask(<i>scriptType</i>,<i>scriptSrc</i>,<i>options</i>)###
<p>通过addTask 方法我们可以给scriptLoad添加一个载入任务</p>
<dl>
	<dt><i>scriptType</i></dt>
	<dd>
		<p>
			确定加载脚本的类型目前有javascript、css两种type
		</p>
	</dd>
	<dt><i>scriptSrc</i></dt>
	<dd>
		<p>
			载入文件的路径重复的路径只会载入一次
		</p>
	</dd>
	<dt><i>options</i></dt>
	<dd>
		<p>
			对载入脚本的详细配置参数有以下可选参数
		</p>
		<dl>
			<dt><i>ver</i></dt>
			<dd>这个参数会使脚本在载入的src后面添加一个?ver=<i>[参数]</i>用以刷新浏览器缓存</dd>
			<dt><i>callBack</i></dt>
			<dd>这个参数会添加一个回掉函数当脚本加载完成时会自动调用这个函数</dd>
			<dt><i>validity</i></dt>
			<dd>这个参数会添加一个预判函数在脚本加载进行一个判断如果函数的返回值不为true加载不会进行</dd>
			<dt><i>rely</i></dt>
			<dd>
				<p>这个参数会表示此文件加载前需要加载另一个脚本此参数配置后加形式会发生变化</p>
				<p>添加此参数后除非依赖脚本成功加载否则不会进行当前文件的加载</p>
				<p>此参数有三种写法</p>
				<dl>
					<dt><i>string 依赖脚本</i></dt>
					<dd>
						<p>直接rely后面输入一个字符串作为<i>scriptSrc</i> 举例 {rely:'rely1.js'}</p>
						<p>此种写法会在rely1.js加载完成后再进行原本的加载</p>
					</dd>
					<dt><i>array [依赖脚本1,依赖脚本2]</i></dt>
					<dd>
						<p>rely后面输入一个数组数组的值作为<i>scriptSrc</i> 举例 {rely:['rely1.js','rely2.js']}</p>
						<p>此种写法会在rely1.js和rely2.js都加载完成后再进行原本的加载</p>
					</dd>
					<dt><i>object {依赖脚本1:{options},依赖脚本2:{options}}</i></dt>
					<dd>
						<p>rely后面输入一个对象对象的属性部分会作为<i>scriptSrc</i>属性的值部分会作为rely文件的<i>options</i> 举例 {rely:{'rely1.js':{'ver':'1.1'},'rely2.js':{'ver':'1.2'}}}</p>
						<p>此种写法会在rely1.js和rely2.js都加载完成后再进行原本的加载</p>
						<p>此种写还支持多级依赖</p>
						<pre>举例 
	{
		rely:{'rely1.js':
			{'ver':'1.1',rely:'rely2.js'}
		}
	}
						</pre>
						<p>
							这种写法会导致加载完rely2 然后加载 rely1 然后加载原本文件
						</p>
					</dd>
				</dl>
			</dd>
		</dl>
	</dd>
</dl>


###scriptLoad.run(<i>options</i>)###
<p>此方法执行后会开始加载所有的通过addTask()配置的加载任务</p>
<p>如果传入<i>options</i>配置所有addTask()添加时没有配置<i>options</i>都会被覆盖上run设置的<i>options</i></p>
