import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus, Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CallbackVkDto, ConnectApiDto, ConnectVkDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthProviderGuard } from './guards/provider.guard';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ProviderService } from './provider/provider.service';
import { Authorization } from './decorators/auth.decorator';
import { VkProvider } from './provider/services/vk.provider';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
  ) {}

  @Get('/oauth/callback/:provider')
  public async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('authData') authData1: object,
    @Query('code') code: string,
    @Param('provider') provider: string,
  ) {
    if (!code) {
      throw new BadRequestException('Не был предоставлен код авторизации.');
    }

    await this.authService.extractProfileFromCode(req, provider, code);

    return res.redirect(
      `${this.configService.getOrThrow<string>('APPLICATION_URL')}/dashboard/settings`,
    );
  }

  @Post('/oauth/callback/v2/vk')
  public async callbackVK(@Body() params: CallbackVkDto) {
    return await this.authService.extractProfileFromCodeVK(params);
  }

  @Get('/oauth/connect/:provider')
  public async connect(@Param() params: ConnectApiDto) {
    if (params.provider === 'vk') return this.authService.connectVK();

    const providerInstance = this.providerService.findByService(
      params.provider,
    );

    return {
      url: providerInstance.getAuthUrl(),
    };
  }

  @Post('/oauth/connect/v2/vk')
  public async connectVK(@Body() params: ConnectVkDto) {
    return this.authService.connectVkV2(params);
  }

  @UseGuards(AuthProviderGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req, res);
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('/session')
  public async getSession(@Req() req: Request) {
    return {
      id: req.session.userId,
      ...req.session.userData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('v2/me')
  public async me(@Req() req: Request) {
    return req.user;
  }
}
