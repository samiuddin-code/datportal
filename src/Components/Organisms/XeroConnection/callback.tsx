import { XeroModule } from "@modules/Xero"
import { useEffect } from "react"

const XeroConsentCallback = () => {
  let xero = new XeroModule()
  const authenticate = (currentURL: string) => {
    xero.authenticate(currentURL).then((res) => {
      window.location.href = "/?xero-authentication=successful"
    })
  }

  useEffect(() => {
    const currentURL = window.location.href;
    authenticate(currentURL)
  }, [])

  return <div></div>
}

export default XeroConsentCallback;