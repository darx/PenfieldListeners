# PenfieldListeners

Penfield event listners and Google and Adobe & Google analytics plugin

### Getting started

```
git clone https://github.com/darx/PenfieldListeners.git
cd PenfieldListeners
npm install --save-dev
```

### Production build

Minification of HTML/CSS/JS

```
npm run build
```

### Install

```
<script src="//cdn.synthetix.com/penfield/get_synthetix.min.js?applicationkey=KEY&consumerkey=KEY"></script>
<script src="path/to/penfield-listeners.min.js"></script>
```

### Initiating script

```

var options = [

	{
		callback: () => { ... },
		provider: 'google',
		source: null
	}, 

	{
		callback: () => { ... },
		provider: 'adobe',
		source: null
	}

];

PenfieldListeners.Analytics.setup(options);

PenfieldListeners.init({}, (err, res) => {
	if (err) { ... }
	else { ... }
});

```

### Document event listeners

Penfield Open

```
document.addEventListener('penfieldopen', () => { ... });
```

Penfield Close

```
document.addEventListener('penfieldclose', () => { ... });
```

Penfield Search

```
document.addEventListener('penfieldsearch', () => { ... });
```

Penfield Article View

```
document.addEventListener('penfieldarticleview', () => { ... });
```

Penfield Article Feedback

```
document.addEventListener('penfieldarticlefeedback', () => { ... });
```

Penfield Requests

```
document.addEventListener('penfieldrequests', () => { ... });
```

Penfield Analytics

```
document.addEventListener('penfieldanalytics', () => { ... });
```
