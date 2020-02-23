<script>
  import Navigation from "../components/Navigation.svelte";

	export let segment;
</script>

<header>
  <Navigation {segment} />
</header>

<main class="flex-grow">
  <slot></slot>
</main>

<footer class="w-full bg-primary-600 text-xs text-white py-6 px-2">
  <div class="container m-auto flex flex-col">
    <div>
      <a href="/terms"> 개인정보 처리방침 </a>
      <span class="ml-2"> 연락처: eunchul.dev@gmail.com </span>
    </div>
    <span class="mt-2">
      TSU.GG isn’t endorsed by official Twitch tv and doesn’t reflect the views or opinions of Twtich tv or anyone officially involved in producing or managing Twitch tv. 
    </span>
  </div>
</footer>
