"use client"

import { useState } from 'react'
import { useProfileForm } from './profileForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import imgTeste from "../../../../../../public/foto1.png"
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfileContent() {
  const form = useProfileForm()
  const [selectedHours, setSelectedHours] = useState<string[]>([])
  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  function generateTimeSlots(): string[] {
    const hours: string[] = []
    for (let i = 8; i <= 21; i++) {
      for (let j = 0; j < 2; j++) {
        const hour = i.toString().padStart(2, '0')
        const minute = (j * 30).toString().padStart(2, '0')
        hours.push(`${hour}:${minute}`)
      }
    }
    return hours
  }
  const hours = generateTimeSlots()

  function toggleHour(hour: string) {
    setSelectedHours(prev =>
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour].sort()
    )
  }

  const timeZones = Intl.supportedValuesOf('timeZone').filter((zone) =>
    zone.startsWith("America/Sao_Paulo") ||
    zone.startsWith("America/Fortaleza") ||
    zone.startsWith("America/Recife") ||
    zone.startsWith("America/Belem") ||
    zone.startsWith("America/Manaus") ||
    zone.startsWith("America/Boa_Vista")
  )

  function onSubmit(data: any) {
    console.log(data)
  }

  return (
    <section className="mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-gray-200 relative h-40 w-40 rounded-full overflow-hidden">
                  <Image
                    src={imgTeste}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da clínica"
                          className="h-12 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">Endereço completo:</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o endereço da clinica..."
                          className="h-12 w-full"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o telefone..."
                          className="h-12 w-full"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">Status da clinica</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ? "active" : "inactive"}
                        >
                          <SelectTrigger className="w-full min-w-0 h-14">
                            <SelectValue placeholder="Selecione o status da clincia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">ATIVO (clinica aberta)</SelectItem>
                            <SelectItem value="inactive">INATIVO (clinica fechada)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="font-semibold">Configurar horários da clinica</Label>

                  <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12"
                      >
                        Clique aqui para selecionar o horário
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Horários disponíveis</DialogTitle>
                        <DialogDescription>
                          Selecionar o melhor horário para você.
                        </DialogDescription>
                      </DialogHeader>

                      <section className="py-2">
                        <p className="text-sm text-muted-foreground mb-4">
                          Clique nos horários abaixo para marcar e desmarcar.
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                          {hours.map((hour) => (
                            <Button
                              key={hour}
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-14 w-full border-2 border-emerald-300 rounded-md text-sm px-4",
                                selectedHours.includes(hour) &&
                                "bg-[#ffa4a4] border-2 border-orange-500"
                              )}
                              aria-pressed={selectedHours.includes(hour)}
                              onClick={() => toggleHour(hour)}
                            >
                              {hour}
                            </Button>
                          ))}
                        </div>
                      </section>

                      <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-400" onClick={() => setDialogIsOpen(false)}>
                        Salvar alterações
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">Selecione o fuso horário</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ? "active" : "inactive"}
                        >
                          <SelectTrigger className="h-14 w-full min-w-0">
                            <SelectValue placeholder="Selecione seu fuso horário " />
                          </SelectTrigger>
                          <SelectContent>
                            {timeZones.map((zone) => (
                              <SelectItem key={zone} value={zone}>
                                {zone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  )
}
