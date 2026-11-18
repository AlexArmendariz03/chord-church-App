"use client"

import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Select, Tooltip } from "antd"
import { useMemo, useState } from "react"
import type { SongListItem } from "@/features/songs/types"

export type LaneKind = "jubilo" | "adoracion" | "ofrenda"

// Si una alabanza ya está en esta cantidad de otros servicios del mes, se avisa en su fila
const REPEAT_WARNING_COUNT = 2
// "6 dic y 13 dic"
const DATE_LIST = new Intl.ListFormat("es", { type: "conjunction" })

type SongLaneProps = {
  kind: LaneKind
  title: string
  // Las alabanzas que se pueden elegir aquí (ya filtradas por categoría)
  songs: SongListItem[]
  // Elegidas en otro grupo: no se ofrecen aquí, porque una alabanza va una sola vez
  excludeIds?: string[]
  // Número en el servicio de la primera de este grupo (júbilo, luego adoración, al final la ofrenda)
  firstPosition: number
  maxCount?: number
  // Lugar y mes en que ya se usó cada alabanza, para el aviso de repetidas
  datesBySong: Map<string, string[]>
  monthName: string
  placeholder: string
  emptyText: string
  // Form.Item pasa value y onChange
  value?: string[]
  onChange?: (value: string[]) => void
}

// Un grupo del orden del servicio: sus alabanzas numeradas, para subirlas, bajarlas o quitarlas,
// y un buscador para agregar otra al final
export const SongLane = ({
  kind, title, songs, excludeIds = [], firstPosition, maxCount, datesBySong, monthName, placeholder, emptyText, value = [], onChange
}: SongLaneProps) => {
  // Se limpia al elegir, para agregar otra enseguida escribiendo su nombre
  const [search, setSearch] = useState("")
  const byId = useMemo(() => new Map(songs.map(song => [song.id, song])), [songs])
  const isFull = maxCount !== undefined && value.length >= maxCount
  // Pasa al cambiar a un estudio con varias ya elegidas: las de más se marcan para quitarlas
  const extra = maxCount !== undefined ? Math.max(0, value.length - maxCount) : 0
  const options = songs
    .filter(song => !value.includes(song.id) && !excludeIds.includes(song.id))
    .map(song => ({ value: song.id, label: song.name, song }))

  const change = (next: string[]) => onChange?.(next)
  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.splice(index + direction, 0, item)
    change(next)
  }

  return (
    <section className={`song-lane is-${kind}`}>
      <header className="song-lane-header">
        <span className="song-lane-dot" />
        <span className="song-lane-title">{title}</span>
        <span className="song-lane-count">{maxCount === 1 ? (value.length ? "1 de 1" : "Opcional") : value.length}</span>
      </header>

      {value.length > 0 ? (
        <ol className="song-lane-list">
          {value.map((id, index) => {
            const song = byId.get(id)
            const dates = datesBySong.get(id) ?? []
            const isRepeated = dates.length >= REPEAT_WARNING_COUNT
            return (
              <li key={id} className={`song-lane-row ${maxCount !== undefined && index >= maxCount ? "is-over" : ""}`}>
                <span className="song-lane-position">{firstPosition + index}</span>
                <span className="song-lane-name">
                  {song?.name ?? "Alabanza eliminada"}
                  {isRepeated && (
                    <Tooltip title={`Ya se usó en ${monthName}: ${DATE_LIST.format(dates)}`}>
                      <span className="song-lane-repeat">
                        <ExclamationCircleOutlined /> {dates.length} veces este mes
                      </span>
                    </Tooltip>
                  )}
                </span>
                {song && <span className="song-lane-key">{song.key}</span>}
                <span className="song-lane-actions">
                  {value.length > 1 && (
                    <>
                      <Button
                        type="text" size="small"
                        icon={<ArrowUpOutlined />} disabled={index === 0}
                        aria-label={`Subir ${song?.name ?? ""}`} onClick={() => move(index, -1)} />
                      <Button
                        type="text" size="small"
                        icon={<ArrowDownOutlined />} disabled={index === value.length - 1}
                        aria-label={`Bajar ${song?.name ?? ""}`} onClick={() => move(index, 1)} />
                    </>
                  )}
                  <Button
                    type="text" size="small"
                    icon={<CloseOutlined />} aria-label={`Quitar ${song?.name ?? ""}`}
                    onClick={() => change(value.filter(item => item !== id))} />
                </span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="song-lane-empty">{emptyText}</p>
      )}

      {extra > 0 && (
        <p className="song-lane-over">
          Este evento lleva solo {maxCount}: quita {extra === 1 ? "la que sobra" : `las ${extra} que sobran`}.
        </p>
      )}

      {!isFull && (
        <Select
          className="song-lane-add" showSearch
          value={null} placeholder={<span><PlusOutlined /> {placeholder}</span>}
          optionFilterProp="label" options={options}
          notFoundContent="Ninguna alabanza con ese nombre"
          optionRender={({ data }) => (
            <span className="song-lane-option">
              <span>{data.song.name}</span>
              <span className="song-lane-key">{data.song.key}</span>
            </span>
          )}
          searchValue={search} onSearch={setSearch}
          onChange={(id: string) => {
            change([...value, id])
            setSearch("")
          }}
          aria-label={placeholder} />
      )}
    </section>
  )
}
