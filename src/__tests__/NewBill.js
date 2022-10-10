/**
 * @jest-environment jsdom
 */

import { waitFor, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { toHaveClass } from '@testing-library/jest-dom'
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'
import Bills from '../containers/Bills'
import store from "../__mocks__/store"
import { fireEvent } from '@testing-library/dom';

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toHaveClass('active-icon')
    })
    test("Then I should be able to change file to one of the allowed formats ", async () => {
      const newBill = new NewBill({document, onNavigate, store: store, localStorage: window.localStorage})
      document.body.innerHTML = NewBillUI()
      const file = screen.getByTestId("file")
      const image = new File(['hello'], 'hello.png', {type: 'image/png'})
      const handleChangeFile = jest.fn((e)=>{newBill.handleChangeFile(e)});
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {target: {files: [image]}})
      expect(file.files[0].name).toBe("hello.png")
      expect(handleChangeFile).toHaveBeenCalled
    })
    test("Then I it should display an error if the file isn't in one of the allowed formats ", async () => {
      const newBill = new NewBill({document, onNavigate, store: store, localStorage: window.localStorage})
      document.body.innerHTML = NewBillUI()
      const file = screen.getByTestId("file")
      const text = new File(['hello'], 'hello.txt', {type: 'text/plain'})
      const handleChangeFile = jest.fn((e)=>{newBill.handleChangeFile(e)});
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {target: {files: [text]}})
      const error = await screen.getByTestId("errorFormatMessage")
      expect(error.innerText).toBe("Choisir un format supporté (.JPG, .JPEG, .PNG)")
    })
    test("Then clicking submit when everything is filled should redirect to Bill ", () =>{
      const onNavigate = jest.fn();
      const newBill = new NewBill({document, onNavigate, store: store, localStorage: window.localStorage})
      screen.getByTestId("expense-type").value ="Transport"
      screen.getByTestId("expense-name").value ="nn"
      screen.getByTestId("amount").value ="857"
      screen.getByTestId("datepicker").value = "13/10/2022"
      screen.getByTestId("vat").value = "78378"
      screen.getByTestId("pct").value = "753"
      screen.getByTestId("commentary").value = "nn"
      const text = new File(['hello'], 'hello.txt', {type: 'text/plain'})
      const handleChangeFile = jest.fn((e)=>{newBill.handleChangeFile(e)});
      const file = screen.getByTestId("file")
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {target: {files: [text]}})
      let validate = screen.getByTestId("submit")
      fireEvent.click(validate)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])

    })
  })
})
