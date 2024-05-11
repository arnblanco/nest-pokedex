import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model, Promise } from 'mongoose';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async esecuteSeed() {

    await this.pokemonModel.deleteMany({});

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1000')

    const insertPromisesArray: { name: string, no: number }[] = []

    data.results.forEach(({  name, url }) => {

      const segments = url.split('/');
      const no:number = +segments[ segments.length - 2 ];

      insertPromisesArray.push({name, no });
      
    });

    await this.pokemonModel.insertMany( insertPromisesArray )

    return 'Seed Executed';

  }

}
