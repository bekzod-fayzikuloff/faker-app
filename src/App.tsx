import './App.module.css'
import React, {SyntheticEvent, useEffect, useState} from "react";
import {fakerCS_CZ, fakerEN, fakerSR_RS_latin} from "@faker-js/faker";
import {Button, Form} from "react-bootstrap";
import style from "./App.module.css"
import {Grid, Input, Slider, Typography} from "@mui/material";
import FakerTable from "./components/Table";
import { json2csv } from 'json-2-csv';


const computeNumValue = (value: number, maxRange: number) => {
  if (isNaN(value)) {
    return 0
  } else if (value > maxRange) {
    return maxRange
  } else return value
}

const computeRandomValue = (value: number) => {
  return computeNumValue(value, 1000)
}

const computeSeedValue = (value: number) => {
  const res = computeNumValue(value, 10_000_000)
  return (res ? res : "")
}


const deleteCharacter = (text: string) => {
  return text.replace(text[Math.round(Math.random() * text.length)], '')
}

const addCharacter = (text: string) => {
  const randIndex = Math.round(Math.random() * text.length)
  return `${text.slice(0, randIndex)}${Math.random().toString(36).substring(4, 5)}${text.slice(randIndex)}`
}

const changePlaces = (text: string) => {
  const swapIndex = Math.floor(Math.random() * text.length - 1);
  const tempStr = text.substring(swapIndex, swapIndex + 2)
  return text.replace(tempStr, `${tempStr[1]}${tempStr[0]}`)

}


function App() {
  const actions = [deleteCharacter, addCharacter, changePlaces]
  const [data, setData] = useState([])
  const [dataLength, setDataLength] = useState(20)
  const [randomChance, setRandomChange] = useState(0)
  const [seed, setSeed] = useState<number | string>('')
  const [locale, setLocale] = useState("en")

  const handleSliderChange = (_: Event, newValue: number) => {
    setRandomChange(computeRandomValue(newValue))
  }

  const handleRandInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = parseFloat(e.target.value as any)
    setRandomChange(computeRandomValue(value))
  }

  const handleSeedChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = parseInt(e.target.value as any)
    setSeed(computeSeedValue(value))
  }

  window.addEventListener("scroll", async () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    if (window.scrollY === scrollableHeight) {
      setDataLength(prevState => prevState + 1)
    }
  })

  const validateErrors = (user) => {
    if (randomChance === 0 ) return user
    const keys = Object.keys(user).slice(1)

    const errorPossibility = Math.round(Math.random() * randomChance + Math.random())

    for (let i = 0; i < errorPossibility; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const key = keys[Math.floor(Math.random() * keys.length)]
      if (user[key].length < 6) {
        continue
      }
      user[key] = action(user[key])
    }
    return user
  }

  const exportToCSV = async () => {
    const csv = await json2csv(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `faker_${locale}_seed_${seed}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getFakerLocale = () => {
    if (locale === "cz") {
      return fakerCS_CZ
    } else if (locale === "sp") {
      return fakerSR_RS_latin
    } else return fakerEN
  }

  const genSeed = () => {
    setSeed(Math.round(Math.random() * 10_000_000))
  }

  const handleChangeLocale = (e: SyntheticEvent<HTMLSelectElement, Event>) => {
    setLocale((e.target as HTMLInputElement).value)
  }

  const getFakerData = (faker) => {
    faker.seed(+seed)
    const usersData = []
    for (let i = 0; i < dataLength; i++) {
      const fullName = `${faker.person.firstName()} ${faker.person.lastName()} ${faker.person.middleName()}`
      let fakeUser = {
        id: faker.string.uuid(),
        fullName,
        address: `${faker.location.city()} ${faker.location.streetAddress()}`,
        phone: faker.phone.number()
      }

      fakeUser = validateErrors(fakeUser)

      usersData.push(fakeUser)
    }

    setData(usersData)
  }


  useEffect(() => {
    setData([])
    getFakerData(getFakerLocale())
  }, [seed, locale, dataLength, randomChance])

  return (
    <>
      <div className={style.form__root}>
        <Form className={style.faker__form}>
          <Form.Select onChange={handleChangeLocale} className={style.lang__select} aria-label="Default select example">
            <option value="en">English</option>
            <option value="cz">Сzech</option>
            <option value="sp">Spain</option>
          </Form.Select>

          <Typography className={style.slider__typography}>Number of error per record</Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                onChange={handleSliderChange}
                value={randomChance}
                step={0.25}
                max={10}
                valueLabelDisplay="auto"
                color="secondary"
              />
            </Grid>
            <Grid item>
              <Input
                onChange={handleRandInputChange}
                value={randomChance}
                size="small"
                inputProps={{
                  min: 0,
                  step: 0.25,
                  max: 1000,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
          </Grid>

          <Form.Group className={`mb-3 ${style.seed__root}`} controlId="formBasicPassword">
            <Form.Control onChange={handleSeedChange} value={seed} type="text" placeholder="Enter seed"/>
            <Button onClick={genSeed}>Random seed</Button>
            <Button variant="success" onClick={exportToCSV}>Export to CSV</Button>
          </Form.Group>

        </Form>
      </div>
      <FakerTable users={data}/>
    </>
  )
}

export default App
