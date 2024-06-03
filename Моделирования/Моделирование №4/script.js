function plotGraphs() {
    // Получаем параметры из формы
    const period = parseFloat(document.getElementById("period").value);
    const total_strokes = parseInt(document.getElementById("total_strokes").value);
    const d = parseFloat(document.getElementById("d").value);

    // Определение функции meshgrid
    function meshgrid(x, y) {
        let X = numeric.rep([y.length, x.length], 0);
        let Y = numeric.rep([y.length, x.length], 0);
        for (let i = 0; i < y.length; i++) {
            for (let j = 0; j < x.length; j++) {
                X[i][j] = x[j];
                Y[i][j] = y[i];
            }
        }
        return [X, Y];
    }

    // Создаем угловую сетку и диапазон длин волн
    const theta = numeric.linspace(-Math.PI / 2, Math.PI / 2, 100);
    const wavelength = numeric.linspace(400, 750, 2000);

    // Генерируем сетку координат
    const [Theta, Wavelength] = meshgrid(theta, wavelength);

    // Вычисляем интенсивность
    const Intensity = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta)), Wavelength)), 2),
        numeric.pow(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta)), Wavelength), 2)
    );

    const tmp = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * total_strokes * d, numeric.sin(Theta)), Wavelength)), 2),
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * d, numeric.sin(Theta)), Wavelength)), 2)
    );

    const finalIntensity = numeric.mul(Intensity, tmp);

    // Данные для 3D графика
    const data3D = {
        x: theta,
        y: wavelength,
        z: finalIntensity,
        type: 'surface',
        colorscale: [
            [0, 'rgb(148, 0, 211)'],
            [0.15, 'rgb(75, 0, 130)'],
            [0.3, 'rgb(0, 0, 255)'],
            [0.45, 'rgb(0, 255, 0)'],
            [0.6, 'rgb(255, 255, 0)'],
            [0.75, 'rgb(255, 165, 0)'],
            [1.0, 'rgb(255, 0, 0)']
        ]
    };

    const layout3D = {
        title: 'Интенсивность дифракционной решетки (3D)',
        scene: {
            xaxis: { title: 'Угол дифракции' },
            yaxis: { title: 'Длина волны (нм)' },
            zaxis: { title: 'Интенсивность' }
        }
    };

    Plotly.newPlot('plot1', [data3D], layout3D);

    // Данные для 2D графика (тепловая карта)
    const data2D = {
        x: theta,
        y: wavelength,
        z: finalIntensity,
        type: 'heatmap',
        colorscale: 'Viridis'
    };

    const layout2D = {
        title: 'Интенсивность дифракционной решетки (2D)',
        xaxis: { title: 'Угол дифракции' },
        yaxis: { title: 'Длина волны (нм)' }
    };

    Plotly.newPlot('plot2', [data2D], layout2D);

    // Создание второго 2D графика для близких спектральных линий
    const blue_wavelength1 = 470;
    const blue_wavelength2 = 475;

    // Генерируем сетку координат для второй визуализации
    const [Theta_close, Wavelength_close] = meshgrid(theta, numeric.linspace(450, 495, 2000));

    // Вычисляем интенсивность для двух близких спектральных линий
    const Intensity_blue1 = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta_close)), blue_wavelength1)), 2),
        numeric.pow(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta_close)), blue_wavelength1), 2)
    );

    const tmp2_1 = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * total_strokes * d, numeric.sin(Theta_close)), blue_wavelength1)), 2),
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * d, numeric.sin(Theta_close)), blue_wavelength1)), 2)
    );

    const Intensity_blue2 = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta_close)), blue_wavelength2)), 2),
        numeric.pow(numeric.div(numeric.mul(Math.PI * period, numeric.sin(Theta_close)), blue_wavelength2), 2)
    );

    const tmp2_2 = numeric.div(
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * total_strokes * d, numeric.sin(Theta_close)), blue_wavelength2)), 2),
        numeric.pow(numeric.sin(numeric.div(numeric.mul(Math.PI * d, numeric.sin(Theta_close)), blue_wavelength2)), 2)
    );

    const finalIntensity_blue1 = numeric.mul(Intensity_blue1, tmp2_1);
    const finalIntensity_blue2 = numeric.mul(Intensity_blue2, tmp2_2);

    const combinedIntensity = numeric.add(finalIntensity_blue1, finalIntensity_blue2);

    // Данные для 2D графика для близких спектральных линий
    const data2D_close = {
        x: theta,
        y: numeric.linspace(450, 495, 2000),
        z: combinedIntensity,
        type: 'heatmap',
        colorscale: 'Viridis'
    };

    const layout2D_close = {
        title: 'Интенсивность близких спектральных линий (2D)',
        xaxis: { title: 'Угол дифракции' },
        yaxis: { title: 'Длина волны (нм)' }
    };

    Plotly.newPlot('plot3', [data2D_close], layout2D_close);
}

// Инициализация графиков при загрузке страницы с параметрами по умолчанию
window.onload = plotGraphs;