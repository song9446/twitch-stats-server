<script context="module">
export const LOCALE = {
  "ko": {
    "name": "ko",
    "options": {
      "months": [
        "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월"
      ],
      "shortMonths": [
        "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월"
      ],
      "days": [
        "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일"
      ],
      "shortDays": ["일", "월", "화", "수", "목", "금", "토"],
      "toolbar": {
        "exportToSVG": "SVG 다운로드",
        "exportToPNG": "PNG 다운로드",
        "exportToCSV": "CSV 다운로드",
        "menu": "메뉴",
        "selection": "선택",
        "selectionZoom": "선택영역 확대",
        "zoomIn": "확대",
        "zoomOut": "축소",
        "pan": "패닝",
        "reset": "원래대로"
      }
    }
  }
};
</script>

<script>
import { onMount } from "svelte";
export let options;
let ApexCharts;
let chart_el;
let chart;
let mounted = false;
$: width="100%";
$: height = isNaN(options.chart.height - 0)? options.chart.height || "auto" : options.chart.height + "px";
$: if(options && ApexCharts) {
  mounted = false;
  options.chart.events = options.chart.events || {};
  let last_onmounted = options.chart.events.mounted;
  options.chart.events.mounted = function(context, configs) {
    last_onmounted && last_onmounted(context, configs);
    mounted = true;
  }
  if(chart) chart.destroy();
  chart = new ApexCharts(chart_el, options);
  chart.render();
}
onMount(async ()=>{
  ApexCharts = (await import('apexcharts')).default;
});
</script>

<div bind:this={chart_el} class="{$$props.class}" style="height: {height}">
{#if !mounted}
  <div class="w-full h-full spinner" style="width: {width}"/>
{/if}
</div>
