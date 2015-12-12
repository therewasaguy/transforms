// via https://antimatter15.com/2015/05/cooley-tukey-fft-dct-idct-in-under-1k-of-javascript/
function miniFFT(re, im) {
    var N = re.length;
    for (var i = 0; i < N; i++) {
        for(var j = 0, h = i, k = N; k >>= 1; h >>= 1)
            j = (j << 1) | (h & 1);
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0]
            im[j] = [im[i], im[i] = im[j]][0]
        }
    }
    for(var hN = 1; hN * 2 <= N; hN *= 2)
        for (var i = 0; i < N; i += hN * 2)
            for (var j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN),
                    sin = Math.sin(Math.PI * (j - i) / hN)
                var tre =  re[j+hN] * cos + im[j+hN] * sin,
                    tim = -re[j+hN] * sin + im[j+hN] * cos;
                re[j + hN] = re[j] - tre; im[j + hN] = im[j] - tim;
                re[j] += tre; im[j] += tim;
            }
}

function miniIFFT(re, im){
    miniFFT(im, re);
    for(var i = 0, N = re.length; i < N; i++){
        im[i] /= N;
        re[i] /= N;
    }
}
