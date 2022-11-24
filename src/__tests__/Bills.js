/*
 * @jest-environment jsdom
 */

import { waitFor, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { toHaveClass } from '@testing-library/jest-dom'
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'
import Bills from '../containers/Bills'
import store from "../__mocks__/store"
import { fireEvent } from '@testing-library/dom';

let location = ""

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toHaveClass('active-icon')

    })

    test("Then the Bills should be displayed", async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText('Transports'))
      const Bill = screen.getByText('Transports')
      expect(Bill.textContent).toBe('Transports')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then handleClickIconEye should be called on eye clicking on the eye icon", () => {
      $.fn.modal = jest.fn();
      const onNavigate = jest.fn()
      document.body.innerHTML = BillsUI({ data: bills })
      let Bill = new Bills({ document, localStorage: window.localStorage, onNavigate, store });
      const button = screen.getAllByTestId("icon-eye")[0]
      const handleClick = jest.fn(() => { Bill.handleClickIconEye(button) });
      button.addEventListener("click", handleClick)
      userEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })

    test("Then when clicking on NewBill the user should be taken to the NewBill page ", () => {
      const onNavigate = jest.fn();
      new Bills({ document, localStorage: window.localStorage, onNavigate, location, store });
      const bill = screen.getByTestId("btn-new-bill")
      fireEvent.click(bill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })

    // tests error messages GET

    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "employee@test.tld" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const trans = await screen.getByText("Transports")
      expect(trans).toBeTruthy()
      const hotel = await screen.getByText("Hôtel et logement")
      expect(hotel).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      
      test("Then the 404 message error is displayed", async () => {
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("Then the 500 message error is displayed", async () => {
        const html = BillsUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })

})


