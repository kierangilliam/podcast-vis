<script lang='ts'>
import ReverseStem from "./ReverseStem.svelte";

</script>

<h1>Methodology</h1>

<p>
	Here I discuss the methods I used for data collection, data wrangling, and visualization.
	Along the way I also share some limitations from these methods.	
</p>

<h3>Data Collection</h3>

<a class='github-link'></a>

<p>
	This step was pretty straightforward: use the YouTube API to collect episode details,
	captions, and statistics.
	I used youtube-dl to download all of the videos publicly available on the JRE channel at 360p, ~30fps. 
	This totaled to be almost 700gb of data. I got rate limited. A lot. 
</p>

<h5>Limitations</h5>

<p>
	YouTube captions are pretty good but definitely are nowhere near human-level transcription.
	I played around with doing speech-to-text with libraries like warp or deepspeech, but 
	didn't have the compute power, at the end of the day, to process all 1500+ episodes.
	I am therefore at the mercy of father Google.
</p>

<h3>Data Wrangling</h3>

<p>
	All of these methods have a shared commonality: unsupervised and computationally cheap
	enough to run on my laptop.
	1500+ episodes is far too many to manually sift through and label. 
	I needed methods that may not be 100% accurate, but were good enough at generalizing.
</p>

<h4>Screen Time</h4>

<p>
	The real question I wanted to ask was, 'is the conversation dominated by one person, 
	or does it have equal representation from all parties?' 
	The process of speaker segmentation from audio is called diarization.
	This led me to trying several diarization techniques. 
	I tried approaches from my own (terrible) homebrewed spectrogram CNN to libraries such as pyannote.
	However, nothing I tried was 1. quick enough for 3600+ hours of audio or 2. anywhere near accurate. 
</p>

<p>
	When I was building the spectrogram CNN, I realized that I would need some sort of 
	way to validate it was working without having to listen to the classified audio.
	So, as a proxy to diarization I built a pretty naive solution. The first step was to 
	take the average across frames. This produced a list of scalars. When visualized over time,
	this is what they look like. 
</p>

<img src="./methodology/frame-averages.png" alt="">

<p>
	As you can see, clusters form nicely out these averages. 
	The next step was to use a 1D clustering algorithm. I chose KDE.
	This ended up proxying diarization pretty well, so I dropped my attempts at a DL 
	solution inplace for this naive method.
</p>

<h5>Limitations</h5>

<p>
	For a good majority of the episodes, this method works pretty well. 
	It fails terribly when there is a lot of movement in the podcast.
</p>

<img src="./methodology/clusters-bad.png" alt="">

<p>
	At this step I need a way to automatically prune episodes with 
	a large frame-average spread.
</p>

<h4>Topics</h4>

<p>
	Loosely, TF-IDF is a cheap algorithm that gives each word in a document (an episode, in this case)
	an <i>importance</i> score. Words that appear commonly in all documents are given a low score.
	Words that appear many times in a handful of documents, but seldom in the majority, are given
	high scores for the former documents and low scores for the latter documents.
	Google uses this technique when ranking what webpages it shows you.
</p>

<p>
	It is often the case you will need to <i>stem</i> words to get the most effectiveness out of TF-IDF.
	Stemming is basically process shortening a word to its most generic version;
	'answer, answering, answered' would all have the same stem, 'answer', for example.
</p>

<h5>Limitations</h5>

<p>
	The <strong>topics over time</strong> chart will not show every single occurrence of a given word.
	This is mainly due to the fact I couldn't get captions for every single video and the captions
	aren't always accurate.
</p>

<h4>Episode Similarity</h4>

<p>
	Similarity could be ranked in many ways... 
	How often does Joe shout? 
	How many likes did an episode get?
	What is the aggregate sentiment in the comments section?
	I opted to rank similarity based on how similar topics were across episodes.
</p>

<p>
	This method relied heavily on the TF-IDF scores addressed above.
	We can treat the TF-IDF scores as vectors and use the cosine angle between two vectors 
	to score their similarity. 
	If that made sense, great, if not, 
	<a href='https://towardsdatascience.com/tf-idf-for-document-ranking-from-scratch-in-python-on-real-world-dataset-796d339a4089'>
		this article
	</a>
	does a good job at explaining this concept.	
</p>

<p>
	As you have have noticed, this method works very well for determining similarity.
	Musicians are often grouped with other musicians, comics with comics, and scientists with scientists.
</p>

<h3>Data Visualization</h3>

<h4>Topics Over Time</h4>

<p>
	This was heavily inspired by 
	<a href='https://diglib.eg.org/bitstream/handle/10.2312/eurova20181105/007-011.pdf?sequence=1&isAllowed=y'>
		this
	</a>
	paper's visualization:
</p>

<div class='image'>
	<img 
		width=350
		src='./methodology/visual-temporal-tweet.png' 
		alt={`screenshot from aforementioned paper's visualization`}
	>
</div>

<p>
	Stemming is communicated using this constantly updating component
	<span class='number-chip'><ReverseStem stem='extinct' /></span>
</p>

<p>
	This is how I show the user that exinct, extinction, and extinctions all mean the same thing in this context.
</p>

<h4>Like Ratio / Views Line Chart</h4>

<p>
	I added this chart last minute because I needed something relatively eye-grabbing 
	that would make a user pause for a second before scrolling. This would give me enough
	time to load and parse all of the data needed for the other visualizations.
</p>

<!-- TODO -->
<!-- <h4>Performance</h4>

<p>
	Performance was a 
</p> -->

<style>
	/* h1, h2, h3, h4, h5 {
		width: fit-content;
		margin-block-start: 0;
		margin-block-end: 0;
	} */
	.image {
		/* width: 100%;
		display: flex;
		justify-content: center; */
		margin-left: var(--s-4);
	}
	img {
		width: 350px;
	}

	p {
		margin: var(--s-3) 0;
	}

	h3 {
		margin-top: var(--s-16);
	}

	h4 {
		text-decoration: underline;
	}
	
	h4, h5 {
		margin-top: var(--s-6);
	}
</style>