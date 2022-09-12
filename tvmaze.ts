import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");


const GENERIC_IMAGE = "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let showRes = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  let shows = (showRes.data.map(({ show }: { show: ShowInterface; }) => ({
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: show.image ? show.image.medium : GENERIC_IMAGE
  })));


  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

/** On submit, invoke searchForShowAndDisplay */
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  let episodeRes = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return (episodeRes.data.map((episode: EpisodeInterface) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  })));
}



/**
 * Given a list of episodes,
 * Clears $episodeList
 * $episodesArea toggles to visible
 * and displays all episodes
* @params {EpisodeInterface[]}
*/

function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesList.empty();
  $episodesArea.show();

  for (let episode of episodes) {
    const $episode = $(
      `<li>
      ${episode.name} (season: ${episode.season} number: ${episode.number})
      </li>
        `);

    $episodesList.append($episode);
  }
}

/** On click, await getEpisodesOfShow()
 * then invoke populateEpisodes()
 */
async function handleEpisodesList(evt : JQuery.ClickEvent) : Promise<void>{
  evt.preventDefault();
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", handleEpisodesList);