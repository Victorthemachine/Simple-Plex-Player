/**
* Loads local files. Taken from TvOS apprentice
* raywenderlich.com Team, Christine ABERNATHY, Jawwad AHMAD, et al. TvOS Apprentice Third Edition: Beginning tvOS development with Swift 4. 3rd edition. Razeware, 2017. ISBN 978-1942878445.
*/

import Foundation
import JavaScriptCore

@objc protocol ResourceLoaderExport : JSExport {
  static func create() -> ResourceLoaderExport
  func loadBundleResource(_ name: String) -> String
  func urlForResource(_ name: String) -> String
}

@objc class ResourceLoader: NSObject, ResourceLoaderExport {
  
  static func create() -> ResourceLoaderExport {
    return ResourceLoader()
  }
  
  func loadBundleResource(_ name: String) -> String {
    let path = Bundle.main.path(forResource: name, ofType: nil)
    do {
      return try String(contentsOfFile: path!,
        encoding: String.Encoding.utf8)
    } catch {
      print("There was a problem")
      return ""
    }
  }
  
  func urlForResource(_ name: String) -> String {
    return Bundle.main.url(forResource: name, withExtension: nil)!.absoluteString
  }
}
