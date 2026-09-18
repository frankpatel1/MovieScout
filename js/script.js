//TMDB 

const API_KEY = 'api_key=1cf50e6248dc270629e802686245c2c8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_POSTER_URL = 'https://placehold.co/1080x1580/111827/ffffff?text=Poster+Unavailable';

const genres = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]

const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const sortSelect = document.getElementById('sort-select');
const mediaTabs = document.querySelectorAll('.media-tab');

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;
var mediaType = 'movie';
var sortType = 'trending';

var selectedGenre = []
function getDiscoverUrl() {
    const sortBy = sortType === 'rating'
        ? 'vote_average.desc&vote_count.gte=100'
        : sortType === 'latest'
            ? (mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc')
            : 'popularity.desc';
    return BASE_URL + '/discover/' + mediaType + '?sort_by=' + sortBy + '&' + API_KEY;
}

function getSearchUrl() {
    return BASE_URL + '/search/' + mediaType + '?' + API_KEY;
}

function getCurrentUrl() {
    return getDiscoverUrl() + (selectedGenre.length ? '&with_genres=' + encodeURI(selectedGenre.join(',')) : '');
}

setGenre();
function setGenre() {
    tagsEl.innerHTML= '';
    genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id=genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', () => {
            if(selectedGenre.length == 0){
                selectedGenre.push(genre.id);
            }else{
                if(selectedGenre.includes(genre.id)){
                    selectedGenre.forEach((id, idx) => {
                        if(id == genre.id){
                            selectedGenre.splice(idx, 1);
                        }
                    })
                }else{
                    selectedGenre.push(genre.id);
                }
            }
            console.log(selectedGenre)
            getMovies(getCurrentUrl())
            highlightSelection()
        })
        tagsEl.append(t);
    })
}

function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.classList.remove('highlight')
    })
    clearBtn()
    if(selectedGenre.length !=0){   
        selectedGenre.forEach(id => {
            const hightlightedTag = document.getElementById(id);
            hightlightedTag.classList.add('highlight');
        })
    }

}

function clearBtn(){
    let clearBtn = document.getElementById('clear');
    if(clearBtn){
        clearBtn.classList.add('highlight')
    }else{
            
        let clear = document.createElement('div');
        clear.classList.add('tag','highlight');
        clear.id = 'clear';
        clear.innerText = 'Clear x';
        clear.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();            
            getMovies(getCurrentUrl());
        })
        tagsEl.append(clear);
    }
    
}

getMovies(getCurrentUrl());

function getMovies(url) {
  lastUrl = url;

  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
        const results = Array.isArray(data?.results) ? data.results : [];
        if (results.length !== 0) {
            showMovies(results);
            currentPage = data.page;
            nextPage = currentPage + 1;
            prevPage = currentPage - 1;
            totalPages = data.total_pages;

            current.innerText = currentPage;

            if(currentPage <= 1){
              prev.classList.add('disabled');
              next.classList.remove('disabled')
            }else if(currentPage>= totalPages){
              prev.classList.remove('disabled');
              next.classList.add('disabled')
            }else{
              prev.classList.remove('disabled');
              next.classList.remove('disabled')
            }

            tagsEl.scrollIntoView({behavior : 'smooth'})

        } else {
            currentPage = 1;
            nextPage = 2;
            prevPage = 0;
            totalPages = 1;
            current.innerText = currentPage;
            prev.classList.add('disabled');
            next.classList.add('disabled');
            main.innerHTML= `<h1 class="no-results">No Results Found</h1>`
        }
    })
    .catch((error) => {
        console.error('Failed to fetch movies:', error);
        currentPage = 1;
        nextPage = 2;
        prevPage = 0;
        totalPages = 1;
        current.innerText = currentPage;
        prev.classList.add('disabled');
        next.classList.add('disabled');
        main.innerHTML = '<h1 class="no-results">Unable to load movies right now.</h1>';
    });

}


function showMovies(data) {
    main.innerHTML = '';
    const sortedData = [...data];
    if (sortType === 'rating') {
        sortedData.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    } else if (sortType === 'latest') {
        const dateKey = mediaType === 'movie' ? 'release_date' : 'first_air_date';
        sortedData.sort((a, b) => (b[dateKey] || '').localeCompare(a[dateKey] || ''));
    }

    sortedData.forEach(movie => {
        const title = mediaType === 'movie' ? movie.title : movie.name;
        const releaseDate = mediaType === 'movie' ? movie.release_date : movie.first_air_date;
        const {poster_path, overview, id} = movie;
        const voteAverage = Number(movie.vote_average ?? 0);
        const year = releaseDate ? releaseDate.slice(0, 4) : 'TBA';
        const stars = '★'.repeat(Math.max(0, Math.min(5, Math.round(voteAverage / 2))));
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
             <img src="${poster_path ? IMG_URL + poster_path : PLACEHOLDER_POSTER_URL}" alt="${title}">

            <div class="movie-info">
                <div class="title-wrap">
                    <h3>${title}</h3>
                    <span class="year-badge">${year}</span>
                </div>
                <span class="${getColor(voteAverage)} rating" aria-label="${voteAverage} out of 10">
                    <span class="stars" aria-hidden="true">${stars}</span> ${voteAverage.toFixed(1)}
                </span>
            </div>

            <div class="overview">

                <h3>Overview</h3>
                ${overview}
                <br/> 
                <button class="know-more" id="${id}">Know More</button>
            </div>
        
        `

        main.appendChild(movieEl);

        document.getElementById(id).addEventListener('click', () => {
          console.log(id)
          openNav(movie)
        })
    })
}

const overlayContent = document.getElementById('overlay-content');
/* Open when someone clicks on the span element */
function openNav(movie) {
  let id = movie.id;
  const videoPath = mediaType === 'movie' ? '/movie/' : '/tv/';
  fetch(BASE_URL + videoPath + id + '/videos?' + API_KEY)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    })
    .then((videoData) => {
      const videos = Array.isArray(videoData?.results) ? videoData.results : [];
      document.getElementById("myNav").style.width = "100%";

      if (videos.length > 0) {
        var embed = [];
        var dots = [];
        videos.forEach((video, idx) => {
          let {name, key, site} = video

          if(site == 'YouTube'){
              
            embed.push(`
              <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          
          `)

            dots.push(`
              <span class="dot">${idx + 1}</span>
            `)
          }
        })
        
        var content = `
        <h1 class="no-results">${mediaType === 'movie' ? movie.original_title : movie.original_name}</h1>
        <br/>
        
        ${embed.join('')}
        <br/>

        <div class="dots">${dots.join('')}</div>
        
        `
        overlayContent.innerHTML = content;
        activeSlide=0;
        showVideos();
      }else{
        overlayContent.innerHTML = `<h1 class="no-results">No Results Found</h1>`
      }
    })
    .catch((error) => {
      console.error('Failed to fetch trailer data:', error);
      document.getElementById("myNav").style.width = "100%";
      overlayContent.innerHTML = '<h1 class="no-results">No trailer available</h1>';
    });
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

var activeSlide = 0;
var totalVideos = 0;

function showVideos(){
  let embedClasses = document.querySelectorAll('.embed');
  let dots = document.querySelectorAll('.dot');

  totalVideos = embedClasses.length; 
  embedClasses.forEach((embedTag, idx) => {
    if(activeSlide == idx){
      embedTag.classList.add('show')
      embedTag.classList.remove('hide')

    }else{
      embedTag.classList.add('hide');
      embedTag.classList.remove('show')
    }
  })

  dots.forEach((dot, indx) => {
    if(activeSlide == indx){
      dot.classList.add('active');
    }else{
      dot.classList.remove('active')
    }
  })
}

const leftArrow = document.getElementById('left-arrow')
const rightArrow = document.getElementById('right-arrow')

leftArrow.addEventListener('click', () => {
  if(activeSlide > 0){
    activeSlide--;
  }else{
    activeSlide = totalVideos -1;
  }

  showVideos()
})

rightArrow.addEventListener('click', () => {
  if(activeSlide < (totalVideos -1)){
    activeSlide++;
  }else{
    activeSlide = 0;
  }
  showVideos()
})


function getColor(vote) {
    if(vote>= 8){
        return 'green'
    }else if(vote >= 5){
        return "orange"
    }else{
        return 'red'
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre=[];
    setGenre();
    if(searchTerm) {
        getMovies(getSearchUrl()+'&query='+encodeURIComponent(searchTerm))
    }else{
        getMovies(getCurrentUrl());
    }

})

mediaTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    mediaType = tab.dataset.mediaType;
    selectedGenre = [];
    mediaTabs.forEach(item => item.classList.toggle('active', item === tab));
    setGenre();
    getMovies(getCurrentUrl());
  });
});

sortSelect.addEventListener('change', () => {
  sortType = sortSelect.value;
  getMovies(getCurrentUrl());
});

prev.addEventListener('click', () => {
  if(prevPage > 0){
    pageCall(prevPage);
  }
})

next.addEventListener('click', () => {
  if(nextPage <= totalPages){
    pageCall(nextPage);
  }
})

function pageCall(page){
  const urlParts = lastUrl.split('?');
  const searchParams = new URLSearchParams(urlParts[1] || '');
  searchParams.set('page', page.toString());
  const url = `${urlParts[0]}?${searchParams.toString()}`;
  getMovies(url);
}
