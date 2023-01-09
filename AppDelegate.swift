/**
 * Serves as a bridge between swift and javascript. Taken from TvOS apprentice
 * raywenderlich.com Team, Christine ABERNATHY, Jawwad AHMAD, et al. TvOS Apprentice Third Edition: Beginning tvOS development with Swift 4. 3rd edition. Razeware, 2017. ISBN 978-1942878445.
 *
 */

import UIKit
import TVMLKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var appController: TVApplicationController?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey : Any]? = nil) -> Bool {
    window = UIWindow(frame: UIScreen.main.bounds)
    
    let appControllerContext = TVApplicationControllerContext()
    appControllerContext.launchOptions = [
      "initialJSDependencies" : initialJSDependencies()
    ]
    
    let javascriptURL = Bundle.main.url(forResource: "main",
      withExtension: "js")
    appControllerContext.javaScriptApplicationURL = javascriptURL!
    
    appController = TVApplicationController(
      context: appControllerContext, window: window,
      delegate: self)
    
    
    return true
  }
}

extension AppDelegate {
  fileprivate func initialJSDependencies() -> [String] {
    return [
        "mustache.min",
        "ResourceLoader",
        "Presenter",
        "EventHandler",
        "SearchHandler"
      ].flatMap {
      let url = Bundle.main.url(forResource: $0, withExtension: "js")
      return url?.absoluteString
    }
  }
}


extension AppDelegate : TVApplicationControllerDelegate {
  func appController(_ appController: TVApplicationController,
    evaluateAppJavaScriptIn jsContext: JSContext) {
      
      jsContext.setObject(ResourceLoader.self,
        forKeyedSubscript: "NativeResourceLoader" as NSString)
      
  }
}
