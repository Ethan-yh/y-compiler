

module.exports = {
    publicPath: './',
    pluginOptions: {
        electronBuilder: {
            // nodeIntegration: true
            preload: './src/preload.js',
        }
    }
}

