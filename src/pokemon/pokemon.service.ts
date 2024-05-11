import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import { CreatePokemonDto,  UpdatePokemonDto } from './dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );

      return pokemon;
    } catch ( error ) {
      return this.handleException( error );
    }
    
  }

  findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto

    return this.pokemonModel.find()
      .limit( limit )
      .skip( offset )
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if( !isNaN( +term )) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if( isValidObjectId( term )) {
      pokemon = await this.pokemonModel.findById( term );
    }

    if( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term })
    }

    if( !pokemon )
      throw new NotAcceptableException(`Pokemon with id, name or no ${ term } not found`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term )

    if( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()

    try {
      await pokemon.updateOne( updatePokemonDto )
    } catch ( error ) {
      return this.handleException( error );
    }
    
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    const pokemon = await this.findOne( id )

    await pokemon.deleteOne()
  }

  private handleException( error: any ) {
    if( error.code === 11000 ) {
      throw new BadRequestException('Pokemon ya existe');
    }

    throw new InternalServerErrorException('Internal Server Error');
  }
}
