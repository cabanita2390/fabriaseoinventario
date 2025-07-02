import { Test, TestingModule } from '@nestjs/testing';
import { ProductoController } from '../../src/producto/producto.controller';
import { ProductoService } from '../../src/producto/producto.service';
import {
  CreateProductoDto,
  TipoProducto,
  EstadoProducto,
} from '../../src/producto/dto/create-producto.dto';
import { UpdateProductoDto } from '../../src/producto/dto/update-producto.dto';

describe('ProductoController', () => {
  let controller: ProductoController;
  let service: Partial<Record<keyof ProductoService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
      findAll: jest
        .fn()
        .mockResolvedValue([
          {
            id: 1,
            nombre: 'Prod1',
            tipoProducto: TipoProducto.MATERIA_PRIMA,
            subtipoInsumo: 'Sub1',
            estado: EstadoProducto.ACTIVO,
            presentacion_idpresentacion: 2,
            unidadmedida_idunidadmedida: 3,
            proveedor_idproveedor: 4,
          },
        ]),
      findOne: jest
        .fn()
        .mockImplementation((id) => ({
          id,
          nombre: 'Prod2',
          tipoProducto: TipoProducto.ETIQUETAS,
          subtipoInsumo: undefined,
          estado: EstadoProducto.INACTIVO,
          presentacion_idpresentacion: 5,
          unidadmedida_idunidadmedida: 6,
          proveedor_idproveedor: 7,
        })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [{ provide: ProductoService, useValue: service }],
    }).compile();

    controller = module.get<ProductoController>(ProductoController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los productos', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        {
          id: 1,
          nombre: 'Prod1',
          tipoProducto: TipoProducto.MATERIA_PRIMA,
          subtipoInsumo: 'Sub1',
          estado: EstadoProducto.ACTIVO,
          presentacion_idpresentacion: 2,
          unidadmedida_idunidadmedida: 3,
          proveedor_idproveedor: 4,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo producto', async () => {
      const dto: CreateProductoDto = {
        nombre: 'NuevoProd',
        tipoProducto: TipoProducto.MATERIAL_DE_ENVASE,
        subtipoInsumo: 'Sub2',
        estado: EstadoProducto.ACTIVO,
        presentacion_idpresentacion: 8,
        unidadmedida_idunidadmedida: 9,
        proveedor_idproveedor: 10,
      };
      await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el producto con el id dado', async () => {
      await expect(controller.findOne(42)).resolves.toEqual({
        id: 42,
        nombre: 'Prod2',
        tipoProducto: TipoProducto.ETIQUETAS,
        subtipoInsumo: undefined,
        estado: EstadoProducto.INACTIVO,
        presentacion_idpresentacion: 5,
        unidadmedida_idunidadmedida: 6,
        proveedor_idproveedor: 7,
      });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar el producto con el id dado', async () => {
      const dto: UpdateProductoDto = { estado: EstadoProducto.INACTIVO };
      await expect(controller.update(99, dto)).resolves.toEqual({
        id: 99,
        ...dto,
      });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el producto con el id dado', async () => {
      await expect(controller.remove(7)).resolves.toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
