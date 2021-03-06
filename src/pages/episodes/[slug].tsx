import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'

import {format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../../services/api';
import { durationToTimeString } from '../../utils/durationToTimeString';

import styles from './episode.module.scss'
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { usePlayer } from '../../contexts /PlayerContext';
import React from 'react';


type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  description: string;
  url: string;
  publishedAt: string;
}
type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
const { play } = usePlayer()

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>
        <Image
          width={700}
          height={160}  
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button>
          <img src="/play.svg" alt="Tocar episódio" onClick={() => play(episode)}/>
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>
      <div className={styles.description}
        dangerouslySetInnerHTML={{__html: episode.description}}
        />
    </div>
    
  )
}

export const getStaticPaths: GetStaticPaths = async() => {
  return{
    paths: [
      { 
        // 
        params: { 
          slug: 'uma-conversa-sobre-programacao-funcional-e-orientacao-a-objetos'
        }
      }
    ],
    // wait content loaded to render the page
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async(ctx) => {
  // receive params from the context
  const { slug } = ctx.params
  const { data } = await api.get(`episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR } ),
    duration: Number(data.file.duration),
    durationAsString: durationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,

  }
  
  return {
    props: { episode },
    revalidate: 60 * 60 * 24, // 24hours
  }
}