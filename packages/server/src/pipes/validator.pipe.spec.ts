import { Test, TestingModule } from '@nestjs/testing';
import { ValidatorPipe } from './validator.pipe';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ArgumentMetadata } from '@nestjs/common';

describe('ValidatorPipe', () => {
  let pipe: ValidatorPipe;

  beforeEach(async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ValidatorPipe,
          useValue: new ValidatorPipe(schema),
        },
      ],
    }).compile();

    pipe = module.get<ValidatorPipe>(ValidatorPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    const mockMetadata: ArgumentMetadata = {
      type: 'body',
      metatype: Object,
      data: 'test',
    };

    it('should validate valid data', async () => {
      const result = await pipe.transform({
        name: 'John Doe',
        age: 25,
      }, mockMetadata);

      expect(result).toEqual({
        name: 'John Doe',
        age: 25,
      });
    });

    it('should throw BadRequestException for invalid data', async () => {
      try {
        await pipe.transform({
          name: 'John Doe',
          age: 15,
        }, mockMetadata);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Validation failed');
      }
    });

    it('should handle undefined data', async () => {
      try {
        await pipe.transform(undefined, mockMetadata);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Validation failed');
      }
    });

    it('should handle null data', async () => {
      try {
        await pipe.transform(null, mockMetadata);
        fail('Expected BadRequestException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Validation failed');
      }
    });
  });
});
