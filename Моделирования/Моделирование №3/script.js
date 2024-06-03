document.addEventListener('DOMContentLoaded', function() {
    // Константы
    const e_charge = 1.60217662e-19;  // элементарный заряд
    const m_electron = 9.10938356e-31; // масса электрона
    const mu_0 = 4 * Math.PI * 1e-7;   // магнитная проницаемость вакуума

    // Проверка загрузки библиотек
    if (typeof math === 'undefined' || typeof Plotly === 'undefined') {
        document.getElementById('log').innerHTML = 'Не удалось загрузить библиотеки.';
        console.error('Не удалось загрузить библиотеки.');
        return;
    } else {
        document.getElementById('log').innerHTML = '<i>библиотеки были загружены успешно<br>2024</i>';
    }

    // Функция для создания линейного массива
    function linspace(start, end, num) {
        const step = (end - start) / (num - 1);
        return Array.from({ length: num }, (v, i) => start + i * step);
    }

    // Функция для дифференциальных уравнений, описывающих движение электрона
    function electron_motion(y, U, B, m, e) {
        const [x, yPos, vx, vy] = y;
        const dvxdt = (e / m) * vy * B;
        const dvydt = -(e / m) * vx * B - (e / m) * U * vy / Math.sqrt(vx ** 2 + vy ** 2);
        return [vx, vy, dvxdt, dvydt];
    }

    // Функция для вычисления радиуса орбиты электрона
    function orbit_radius(I, U, n) {
        const B = mu_0 * n * I;
        if (B === 0) return;
        return Math.sqrt((m_electron * 2 * U) / (Math.abs(e_charge) * (B ** 2)));
    }

    function simulate_and_plot(U, Ic, Rk, steps = 1000, tmax = 1e-6, stop_velocity = null) {
        const n = 100; // Число витков на единицу длины
        const B = mu_0 * n * Ic; // Магнитное поле внутри соленоида

        // Начальные условия
        const x0 = Rk;
        const y0 = 0;
        const v0 = Math.sqrt(2 * Math.abs(e_charge) * U / m_electron);
        const r_orbit = orbit_radius(Ic, U, n); // Вычисление радиуса орбиты

        // Временной массив
        const t = linspace(0, tmax, steps);
        const dt = t[1] - t[0];  // Шаг времени

        // Инициализация массива для хранения решения
        let sol = [[x0, y0, v0, 0]];

        // Численное решение дифференциальных уравнений методом Эйлера
        for (let i = 1; i < t.length; i++) {
            const [x, yPos, vx, vy] = sol[i - 1];
            const [vx_new, vy_new, dvxdt, dvydt] = electron_motion([x, yPos, vx, vy], U, B, m_electron, e_charge);
            const x_new = x + vx_new * dt;
            const y_new = yPos + vy_new * dt;
            const vx_new_updated = vx + dvxdt * dt;
            const vy_new_updated = vy + dvydt * dt;

            sol.push([x_new, y_new, vx_new_updated, vy_new_updated]);

            // Остановка моделирования по заданной скорости
            if (stop_velocity !== null && Math.sqrt(vx_new_updated ** 2 + vy_new_updated ** 2) <= stop_velocity) {
                break;
            }
        }

        // Построение траектории
        const trace = {
            x: sol.map(point => point[0]),
            y: sol.map(point => point[1]),
            mode: 'lines',
            type: 'scatter',
            line: {color: 'purple' }
        };

        const layout = {
            title: '<b>Траектория электрона</b>',
            xaxis: { title: '<b>x</b>' },
            yaxis: { title: '<b>y</b>' },
            showlegend: false
        };

        Plotly.newPlot('plot', [trace], layout);

        return r_orbit;
    }

    function find_required_current(Ra, Rk, n, U, charge) {
        const r_orbit = (Ra - Rk) / 2;
        if (r_orbit * charge * n * mu_0 === 0) return;
        return (m_electron * Math.sqrt(2 * (charge / m_electron) * U)) / (r_orbit * charge * n * mu_0);
    }

    // Функция для построения диаграммы (Ic от U) и отметки области, где электрон описывает окружность диаметром (Ra-Rk)
    function plot_Ic_U_diagram_with_circle(Ra, Rk, n) {
        const U_values = linspace(0, 1000, 100); // Диапазон разности потенциалов

        const Ic_values = U_values.map(U => find_required_current(Ra, Rk, n, U, e_charge));

        const trace = {
            x: U_values,
            y: Ic_values,
            mode: 'lines',
            type: 'scatter',
            fill: 'tozeroy',
            line: {color: 'purple' },
            name: 'Электрон описывает окружность (Ra-Rk)'
        };

        const layout = {
            title: '<b>Диаграмма Ic от U</b>',
            xaxis: { title: '<b>Разность потенциалов (U)</b>' },
            yaxis: { title: '<b>Сила тока в соленоиде (Ic)</b>' },
            showlegend: true
        };

        Plotly.newPlot('plot2', [trace], layout);
    }

    // Обработчик формы
    document.getElementById('parameters-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const Ra = parseFloat(document.getElementById('Ra').value);
        const Rk = parseFloat(document.getElementById('Rk').value);
        const U = parseFloat(document.getElementById('U').value);
        const Ic = parseFloat(document.getElementById('Ic').value);
        const n = parseInt(document.getElementById('n').value);

        // Моделирование и построение траектории
        const r_orbit = simulate_and_plot(U, Ic, Rk, 1000, 1e-6, 1e5);
        console.log("Радиус орбиты электрона:", r_orbit);

        // Отображение радиуса орбиты
        document.getElementById('orbit-radius').innerHTML = `<b>Радиус орбиты электрона:</b> ${r_orbit ? r_orbit.toFixed(6) + ' м' : 'не определен'}`;

        // Построение диаграммы Ic от U
        plot_Ic_U_diagram_with_circle(Ra, Rk, n);
    });
});
